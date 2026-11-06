import prisma from "../config/database";

const WEBHOOK_URL =
  process.env.WEBHOOK_URL || "http://localhost:3000/api/webhook/mock";
  
const MAX_ATTEMPTS = 3;
const POLL_INTERVAL = 3000;

interface ClaimedJob {
  id: string;
  payload: unknown;
  attempts: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function claimNextJob(): Promise<ClaimedJob | null> {
  return prisma.$transaction(async (tx) => {
    const jobs = await tx.$queryRaw<ClaimedJob[]>`
      WITH next_job AS (
        SELECT "id"
        FROM "NotificationJob"
        WHERE "status" = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE "NotificationJob" AS job
      SET
        "status" = 'PROCESSING',
        "attempts" = job."attempts" + 1
      FROM next_job
      WHERE job."id" = next_job."id"
      RETURNING
        job."id",
        job."payload",
        job."attempts"
    `;

    return jobs[0] ?? null;
  });
}

async function processJob(job: ClaimedJob) {
  try {
    console.log(`Processing job ${job.id}, attempt ${job.attempts}`);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job.payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned HTTP ${response.status}`);
    }

    await prisma.notificationJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        lastError: null,
      },
    });

    console.log(`Job ${job.id} completed successfully`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error";

    const isFinalAttempt = job.attempts >= MAX_ATTEMPTS;

    await prisma.notificationJob.update({
      where: { id: job.id },
      data: {
        status: isFinalAttempt ? "FAILED" : "PENDING",
        lastError: message,
      },
    });

    console.error(`Job ${job.id} failed: ${message}`);

    if (!isFinalAttempt) {
      const backoff = 1000 * 2 ** (job.attempts - 1);
      await sleep(backoff);
    }
  }
}

async function startWorker() {
  console.log("Notification worker started...");

  while (true) {
    try {
      const job = await claimNextJob();

      if (job) {
        await processJob(job);
      } else {
        await sleep(POLL_INTERVAL);
      }
    } catch (error) {
      console.error("Worker error:", error);
      await sleep(POLL_INTERVAL);
    }
  }
}

startWorker()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

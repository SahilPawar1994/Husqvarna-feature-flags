import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import { randomUUID } from "crypto";

import app from "../app";
import prisma from "../config/database";

let testKey = "";

afterEach(async () => {
  if (!testKey) return;

  const flags = await prisma.featureFlag.findMany({
    where: { key: testKey },
    select: { id: true },
  });

  const flagIds = flags.map((flag) => flag.id);

  if (flagIds.length > 0) {
    await prisma.auditLog.deleteMany({
      where: { flagId: { in: flagIds } },
    });

    await prisma.notificationJob.deleteMany({
      where: { flagId: { in: flagIds } },
    });

    await prisma.featureFlag.deleteMany({
      where: { id: { in: flagIds } },
    });
  }

  testKey = "";
});

describe("Feature Flag API Integration Tests", () => {
  it("should create a feature flag and persist its audit log", async () => {
    testKey = `test-${randomUUID()}`;

    const payload = {
      key: testKey,
      description: "Integration test feature flag",
      environment: "DEV",
      enabled: true,
    };

    const response = await request(app).post("/api/flags").send(payload);

    // Verify HTTP response
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.key).toBe(testKey);

    const flagId = response.body.data.id;

    // Verify feature flag persisted in PostgreSQL
    const savedFlag = await prisma.featureFlag.findUnique({
      where: {
        id: flagId,
      },
    });

    expect(savedFlag).not.toBeNull();
    expect(savedFlag?.enabled).toBe(true);
    expect(savedFlag?.environment).toBe("DEV");

    // Verify audit record persisted
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        flagId,
        action: "CREATED",
      },
    });

    expect(auditLog).not.toBeNull();
    expect(auditLog?.actor).toBe("demo-user");
    expect(auditLog?.newState).toMatchObject({
      key: testKey,
      enabled: true,
    });
  });
});

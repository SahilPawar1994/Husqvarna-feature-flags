import { PrismaClient, Environment, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const featureFlags = [
  {
    key: "new-checkout-flow",
    description: "Enable the redesigned checkout experience",
    environment: Environment.DEV,
    enabled: true,
  },
  {
    key: "new-checkout-flow",
    description: "Enable the redesigned checkout experience",
    environment: Environment.STAGING,
    enabled: true,
  },
  {
    key: "new-checkout-flow",
    description: "Enable the redesigned checkout experience",
    environment: Environment.PROD,
    enabled: false,
  },
  {
    key: "dark-mode",
    description: "Enable dark mode across the application",
    environment: Environment.DEV,
    enabled: true,
  },
  {
    key: "dark-mode",
    description: "Enable dark mode across the application",
    environment: Environment.PROD,
    enabled: true,
  },
  {
    key: "new-payment-gateway",
    description: "Enable integration with the new payment gateway",
    environment: Environment.STAGING,
    enabled: false,
  },
  {
    key: "ai-product-recommendations",
    description: "Enable AI-powered product recommendations",
    environment: Environment.DEV,
    enabled: true,
  },
  {
    key: "guest-checkout",
    description: "Allow customers to checkout without an account",
    environment: Environment.PROD,
    enabled: false,
  },
];

async function main() {
  console.log("Starting database seeding...");

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: {
        key_environment: {
          key: flag.key,
          environment: flag.environment,
        },
      },
      update: {},
      create: {
        ...flag,
        auditLogs: {
          create: {
            actor: "system:seed",
            action: "CREATED",
            previousState: Prisma.JsonNull,
            newState: {
              key: flag.key,
              description: flag.description,
              environment: flag.environment,
              enabled: flag.enabled,
            },
          },
        },
      },
    });

    console.log(`Seeded: ${flag.key} (${flag.environment})`);
  }

  console.log("Database seeding completed!");
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

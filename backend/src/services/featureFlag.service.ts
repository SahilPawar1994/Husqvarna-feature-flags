import { Environment, Prisma, AuditAction } from "@prisma/client";
import prisma from "../config/database";
import { CreateFeatureFlagInput } from "../validators/featureFlag.validator";

interface GetFeatureFlagsParams {
  environment?: Environment;
  enabled?: boolean;
}

export const createFeatureFlag = async (
  input: CreateFeatureFlagInput,
  actor: string,
) => {
  return prisma.$transaction(async (tx) => {
    const flag = await tx.featureFlag.create({
      data: {
        key: input.key,
        description: input.description,
        environment: input.environment,
        enabled: input.enabled,
      },
    });

    await tx.auditLog.create({
      data: {
        flagId: flag.id,
        actor,
        action: AuditAction.CREATED,
        previousState: Prisma.JsonNull,
        newState: {
          key: flag.key,
          description: flag.description,
          environment: flag.environment,
          enabled: flag.enabled,
        },
      },
    });

    return flag;
  });
};

export const getFeatureFlags = async ({
  environment,
  enabled,
}: GetFeatureFlagsParams) => {
  const where: Prisma.FeatureFlagWhereInput = {};

  if (environment) {
    where.environment = environment;
  }

  if (enabled !== undefined) {
    where.enabled = enabled;
  }

  return prisma.featureFlag.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const toggleFeatureFlag = async (flagId: string, actor: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Get the current feature flag
    const existingFlag = await tx.featureFlag.findUnique({
      where: { id: flagId },
    });

    if (!existingFlag) {
      const error = new Error("Feature flag not found");
      Object.assign(error, { statusCode: 404 });
      throw error;
    }

    const previousEnabled = existingFlag.enabled;
    const newEnabled = !previousEnabled;

    // 2. Atomically update only if the old state is unchanged
    const updateResult = await tx.featureFlag.updateMany({
      where: {
        id: flagId,
        enabled: previousEnabled,
      },
      data: {
        enabled: newEnabled,
      },
    });

    // Another request may have changed the flag first
    if (updateResult.count === 0) {
      const error = new Error(
        "Feature flag was modified by another request. Please retry.",
      );
      Object.assign(error, { statusCode: 409 });
      throw error;
    }

    // 3. Get the updated record
    const updatedFlag = await tx.featureFlag.findUniqueOrThrow({
      where: { id: flagId },
    });

    // 4. Insert audit record
    await tx.auditLog.create({
      data: {
        flagId,
        actor,
        action: AuditAction.TOGGLED,
        previousState: {
          enabled: previousEnabled,
        },
        newState: {
          enabled: newEnabled,
        },
      },
    });

    // 5. Queue notification for production flags
    if (existingFlag.environment === Environment.PROD) {
      await tx.notificationJob.create({
        data: {
          flagId,
          status: "PENDING",
          payload: {
            event: "FEATURE_FLAG_TOGGLED",
            flagKey: updatedFlag.key,
            environment: updatedFlag.environment,
            previousState: previousEnabled,
            newState: newEnabled,
            actor,
          },
        },
      });
    }

    return updatedFlag;
  });
};

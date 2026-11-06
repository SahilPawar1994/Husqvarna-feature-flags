import { Request, Response, NextFunction } from "express";
import { Environment } from "@prisma/client";
import {
  getFeatureFlags,
  createFeatureFlag,
  toggleFeatureFlag
} from "../services/featureFlag.service";

import { createFeatureFlagSchema } from "../validators/featureFlag.validator";

export const createFeatureFlagController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = createFeatureFlagSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const flag = await createFeatureFlag(validation.data, "demo-user");

    res.status(201).json({
      success: true,
      message: "Feature flag created successfully",
      data: flag,
    });
  } catch (error) {
    next(error);
  }
};

export const listFeatureFlags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const environment = req.query.environment as Environment | undefined;

    const enabled =
      req.query.enabled === undefined
        ? undefined
        : req.query.enabled === "true";

    const flags = await getFeatureFlags({
      environment,
      enabled,
    });

    res.status(200).json({
      success: true,
      data: flags,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFeatureFlagController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const flag = await toggleFeatureFlag(id, "demo-user");

    res.status(200).json({
      success: true,
      message: "Feature flag toggled successfully",
      data: flag,
    });
  } catch (error) {
    next(error);
  }
};

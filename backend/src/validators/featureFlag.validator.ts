import { z } from "zod";

export const createFeatureFlagSchema = z.object({
  key: z
    .string()
    .trim()
    .min(3, "Key must contain at least 3 characters")
    .max(100, "Key cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Key must contain lowercase letters, numbers and hyphens"
    ),

  description: z
    .string()
    .trim()
    .min(5, "Description must contain at least 5 characters")
    .max(500, "Description cannot exceed 500 characters"),

  environment: z.enum(["DEV", "STAGING", "PROD"]),

  enabled: z.boolean().optional().default(false),
});

export type CreateFeatureFlagInput = z.infer<
  typeof createFeatureFlagSchema
>;
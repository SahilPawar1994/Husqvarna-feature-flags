import { Router } from "express";
import { listFeatureFlags, createFeatureFlagController, toggleFeatureFlagController } from "../controllers/featureFlag.controller";

const router = Router();

router.get("/", listFeatureFlags);

router.post("/", createFeatureFlagController);

router.patch("/:id/toggle", toggleFeatureFlagController);

export default router;
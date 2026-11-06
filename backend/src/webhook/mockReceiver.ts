import { Router, Request, Response } from "express";

const router = Router();

router.post("/mock", (req: Request, res: Response) => {
  console.log("=================================");
  console.log("Mock Webhook Received");
  console.log("Event:", req.body.event);
  console.log("Payload:", req.body);
  console.log("=================================");

  res.status(200).json({
    success: true,
    message: "Webhook received successfully",
  });
});

export default router;
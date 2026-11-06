import { Router } from "express";
import { listAuditLogs } from "../controllers/auditLog.controller";

const router = Router();

router.get("/", listAuditLogs);

export default router;
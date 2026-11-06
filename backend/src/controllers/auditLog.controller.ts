import { Request, Response, NextFunction } from "express";
import { getRecentAuditLogs } from "../services/auditLog.service";

export const listAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestedLimit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Limit must be an integer between 1 and 100",
      });
      return;
    }

    const logs = await getRecentAuditLogs(requestedLimit);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

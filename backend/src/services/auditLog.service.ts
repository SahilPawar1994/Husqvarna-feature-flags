import prisma from "../config/database";

export const getRecentAuditLogs = async (limit = 10) => {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: {
      timestamp: "desc",
    },
    include: {
      flag: {
        select: {
          key: true,
          environment: true,
        },
      },
    },
  });
};

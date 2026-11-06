import type { AuditLog } from "../types";

interface ActivityFeedProps {
  logs: AuditLog[];
  loading: boolean;
}

export default function ActivityFeed({ logs, loading }: ActivityFeedProps) {
  if (loading) {
    return <div className="empty-state">Loading activity...</div>;
  }

  if (logs.length === 0) {
    return <div className="empty-state">No recent activity.</div>;
  }

  return (
    <div className="activity-list">
      {logs.map((log) => (
        <div className="activity-item" key={log.id}>
          <div className="activity-icon">
            {log.action === "CREATED" ? "+" : "↔"}
          </div>

          <div className="activity-details">
            <strong>{log.flag.key}</strong>

            <p>
              {log.action === "CREATED"
                ? "Feature flag created"
                : `Changed from ${
                    log.previousState?.enabled ? "Enabled" : "Disabled"
                  } to ${log.newState.enabled ? "Enabled" : "Disabled"}`}
            </p>

            <span>
              {log.actor} · {log.flag.environment} ·{" "}
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

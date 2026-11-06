import type { FeatureFlag } from "../types";

interface FeatureFlagTableProps {
  flags: FeatureFlag[];
  loading: boolean;
  togglingId: string | null;
  onToggle: (id: string) => void;
}

export default function FeatureFlagTable({
  flags,
  loading,
  togglingId,
  onToggle,
}: FeatureFlagTableProps) {
  if (loading) {
    return <div className="empty-state">Loading feature flags...</div>;
  }

  if (flags.length === 0) {
    return (
      <div className="empty-state">
        No feature flags found for these filters.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Feature flag</th>
            <th>Environment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>
                <strong>{flag.key}</strong>
                <p className="description">{flag.description}</p>
              </td>

              <td>
                <span
                  className={`environment ${flag.environment.toLowerCase()}`}
                >
                  {flag.environment}
                </span>
              </td>

              <td>
                <span
                  className={`status ${flag.enabled ? "enabled" : "disabled"}`}
                >
                  {flag.enabled ? "Enabled" : "Disabled"}
                </span>
              </td>

              <td>
                <button
                  className={`toggle-button ${flag.enabled ? "active" : ""}`}
                  disabled={togglingId === flag.id}
                  onClick={() => onToggle(flag.id)}
                  aria-label={`Toggle ${flag.key}`}
                >
                  {togglingId === flag.id
                    ? "Updating..."
                    : flag.enabled
                      ? "Disable"
                      : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

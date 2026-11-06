import type { Environment } from "../types";

interface FilterBarProps {
  environment: Environment | "";
  enabled: boolean | undefined;
  onEnvironmentChange: (value: Environment | "") => void;
  onStatusChange: (value: boolean | undefined) => void;
}

export default function FilterBar({
  environment,
  enabled,
  onEnvironmentChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div>
        <label htmlFor="environment">Environment</label>
        <select
          id="environment"
          value={environment}
          onChange={(e) =>
            onEnvironmentChange(e.target.value as Environment | "")
          }
        >
          <option value="">All environments</option>
          <option value="DEV">Development</option>
          <option value="STAGING">Staging</option>
          <option value="PROD">Production</option>
        </select>
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={enabled === undefined ? "" : String(enabled)}
          onChange={(e) => {
            const value = e.target.value;

            onStatusChange(value === "" ? undefined : value === "true");
          }}
        >
          <option value="">All statuses</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>
    </div>
  );
}

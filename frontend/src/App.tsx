import { useCallback, useEffect, useState } from "react";

import DashboardHeader from "./components/DashboardHeader";
import FilterBar from "./components/FilterBar";
import FeatureFlagTable from "./components/FeatureFlagTable";
import FeatureFlagForm from "./components/FeatureFlagForm";

import {
  getFeatureFlags,
  createFeatureFlag,
  toggleFeatureFlag,
} from "./services/api";

import type { CreateFeatureFlagInput, Environment, FeatureFlag } from "./types";

import "./App.css";

import ActivityFeed from "./components/ActivityFeed";
import { getRecentAuditLogs } from "./services/api";
import type { AuditLog } from "./types";

function App() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [environment, setEnvironment] = useState<Environment | "">("");
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState("");

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    setActivityLoading(true);

    try {
      const data = await getRecentAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getFeatureFlags(environment || undefined, enabled);

      setFlags(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load feature flags",
      );
    } finally {
      setLoading(false);
    }
  }, [environment, enabled]);

  useEffect(() => {
    void fetchFlags();
    void fetchAuditLogs();
  }, [fetchFlags, fetchAuditLogs]);

  const handleCreate = async (input: CreateFeatureFlagInput) => {
    await createFeatureFlag(input);
    setShowCreateForm(false);
    await fetchFlags();
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    setError("");

    try {
      await toggleFeatureFlag(id);
      await fetchFlags();
      await fetchAuditLogs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle feature flag",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const enabledCount = flags.filter((flag) => flag.enabled).length;
  const disabledCount = flags.length - enabledCount;

  return (
    <main className="dashboard">
      <DashboardHeader onCreateClick={() => setShowCreateForm(true)} />

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total flags</span>
          <strong>{flags.length}</strong>
        </div>

        <div className="stat-card">
          <span>Enabled</span>
          <strong className="success-text">{enabledCount}</strong>
        </div>

        <div className="stat-card">
          <span>Disabled</span>
          <strong className="muted-text">{disabledCount}</strong>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>All feature flags</h2>
            <p>Manage and monitor your feature releases.</p>
          </div>

          <button className="refresh-button" onClick={fetchFlags}>
            Refresh
          </button>
        </div>

        <FilterBar
          environment={environment}
          enabled={enabled}
          onEnvironmentChange={setEnvironment}
          onStatusChange={setEnabled}
        />

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <FeatureFlagTable
          flags={flags}
          loading={loading}
          togglingId={togglingId}
          onToggle={handleToggle}
        />
      </section>
      <section className="content-card activity-section">
        <div className="section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Track changes made to your feature flags.</p>
          </div>
        </div>

        <ActivityFeed logs={auditLogs} loading={activityLoading} />
      </section>
      {showCreateForm && (
        <FeatureFlagForm
          onSubmit={handleCreate}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </main>
  );
}

export default App;

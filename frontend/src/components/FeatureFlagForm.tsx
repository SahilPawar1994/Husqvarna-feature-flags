import { useState, type FormEvent } from "react";
import type { CreateFeatureFlagInput, Environment } from "../types";

interface FeatureFlagFormProps {
  onSubmit: (input: CreateFeatureFlagInput) => Promise<void>;
  onClose: () => void;
}

export default function FeatureFlagForm({
  onSubmit,
  onClose,
}: FeatureFlagFormProps) {
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState<Environment>("DEV");
  const [enabled, setEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmit({
        key,
        description,
        environment,
        enabled,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create feature flag",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>Create feature flag</h2>
            <p>Add a new flag to an environment.</p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="flag-key">Flag key</label>
          <input
            id="flag-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="new-checkout-flow"
            required
            minLength={3}
            maxLength={100}
          />

          <label htmlFor="flag-description">Description</label>
          <textarea
            id="flag-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this feature does"
            required
            minLength={5}
            maxLength={500}
          />

          <label htmlFor="flag-environment">Environment</label>
          <select
            id="flag-environment"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as Environment)}
          >
            <option value="DEV">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PROD">Production</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            Enable this flag immediately
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create flag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

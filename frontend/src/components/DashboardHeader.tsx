interface DashboardHeaderProps {
  onCreateClick: () => void;
}

export default function DashboardHeader({
  onCreateClick,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <div className="brand">
          <span className="brand-mark">H</span>
          <span>HUSQVARNA</span>
        </div>

        <h1>Feature Flags</h1>
        <p>Manage feature releases across your environments.</p>
      </div>

      <button className="primary-button" onClick={onCreateClick}>
        <span>+</span> Create feature flag
      </button>
    </header>
  );
}
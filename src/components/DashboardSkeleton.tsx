export function DashboardSkeleton() {
  return (
    <section className="skeleton-shell" aria-label="Loading dashboard skeleton">
      <div className="skeleton-header">
        <div className="skeleton-block logo" />
        <div className="skeleton-lines">
          <span />
          <strong />
          <p />
        </div>
      </div>

      <div className="skeleton-grid six">
        {Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index} />)}
      </div>

      <div className="skeleton-grid analytics">
        <div className="skeleton-card tall" />
        <div className="skeleton-card tall" />
        <div className="skeleton-card tall" />
      </div>

      <div className="skeleton-table">
        {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
      </div>
    </section>
  );
}

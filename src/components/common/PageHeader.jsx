/**
 * PageHeader — standard page title + subtitle + optional right-side action slot.
 * Used on the Dashboard to avoid ad-hoc inline divs.
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="dashboard-header mb-5">
      <div>
        <h1 className="page-title mb-1">{title}</h1>
        {subtitle && (
          <p className="small-text text-muted" style={{ margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

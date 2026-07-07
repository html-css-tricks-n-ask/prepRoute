
export default function EmptyState({
  title,
  description,
  icon,
  actionButton,
  className = '',
  style = {}
}) {
  return (
    <div className={`empty-state ${className}`.trim()} style={style}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--heading)', marginBottom: '8px', marginTop: 0 }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--body-text)', fontSize: '14px', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {actionButton}
    </div>
  );
}

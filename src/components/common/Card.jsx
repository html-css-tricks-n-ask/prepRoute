import React from 'react';

export default function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  style = {},
  footer
}) {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="caption text-muted" style={{ margin: '4px 0 0 0' }}>{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

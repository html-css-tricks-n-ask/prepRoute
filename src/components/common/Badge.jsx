import React from 'react';

export default function Badge({
  status,
  children,
  className = '',
  style = {}
}) {
  const badgeText = children || status;
  const statusClass = status ? `badge-${status}` : '';
  const fullClassName = `badge ${statusClass} ${className}`.trim();

  return (
    <span className={fullClassName} style={style}>
      {badgeText}
    </span>
  );
}

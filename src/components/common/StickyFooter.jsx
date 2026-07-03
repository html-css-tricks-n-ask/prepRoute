import React from 'react';

export default function StickyFooter({ children, className = '' }) {
  return (
    <div className={`form-actions-footer ${className}`}>
      {children}
    </div>
  );
}

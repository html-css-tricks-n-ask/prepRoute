import React from 'react';
import Card from '../../../components/common/Card';

export default function DashboardSkeleton() {
  return (
    <Card className="skeleton-pulse">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div className="skeleton-line" style={{ width: '30%' }}></div>
          <div className="skeleton-line" style={{ width: '15%' }}></div>
          <div className="skeleton-line" style={{ width: '10%' }}></div>
          <div className="skeleton-line" style={{ width: '15%' }}></div>
          <div className="skeleton-line" style={{ width: '15%' }}></div>
          <div className="skeleton-line" style={{ width: '15%', marginLeft: 'auto' }}></div>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div className="skeleton-line" style={{ width: '30%', height: '20px' }}></div>
            <div className="skeleton-line" style={{ width: '15%' }}></div>
            <div className="skeleton-line" style={{ width: '10%' }}></div>
            <div className="skeleton-line" style={{ width: '15%' }}></div>
            <div className="skeleton-line" style={{ width: '15%' }}></div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
              <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
              <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

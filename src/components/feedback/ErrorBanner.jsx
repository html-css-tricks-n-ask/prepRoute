/**
 * ErrorBanner — inline error callout used when a page fails to load data.
 * Replaces the identical inline error div in Dashboard and PreviewPublish.
 */
export default function ErrorBanner({ message }) {
  return (
    <div
      role="alert"
      style={{
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        color: '#fca5a5',
        padding: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {message}
    </div>
  );
}

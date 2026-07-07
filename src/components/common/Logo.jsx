/**
 * Logo — reusable PrepRoute brand component.
 *
 * Props:
 *   variant  'full' | 'icon'
 *             'full'  → horizontal wordmark (logo.png)
 *             'icon'  → square P-mark (icon-192x192.png), for collapsed sidebar
 *   height   number   displayed height in px (default 36)
 *   width    number   override the auto-computed width (optional)
 *   className string  extra CSS classes
 *   onClick  func     click handler (optional)
 *   style    object   extra inline styles
 */
export default function Logo({
  variant: _variant = "full",
  height = 36,
  width, // optional explicit override
  className = "",
  onClick,
  style = {},
}) {
  const variant = _variant;

  const shared = {
    objectFit: "contain",
    flexShrink: 0,
    cursor: onClick ? "pointer" : "default",
  };

  // ── Icon variant (collapsed sidebar) ──────────────────────────────────────
  if (variant === 'icon') {
    const sz = width ?? height;
    return (
      <img
        src="/icon-192x192.png"
        alt="PrepRoute"
        draggable={false}
        onClick={onClick}
        className={className}
        style={{
          ...shared,
          width: sz,
          height: sz,
          borderRadius: '8px',
          ...style,
        }}
      />
    );
  }

  // ── Full wordmark variant ─────────────────────────────────────────────────
  // logo.png natural ratio: 870 × 430 ≈ 2.02 : 1
  const computedWidth = width ?? Math.round(height * 2.02);

  return (
    <img
      src="/logo.png"
      alt="PrepRoute"
      draggable={false}
      onClick={onClick}
      className={className}
      style={{
        ...shared,
        height,
        width: computedWidth,
        ...style,
      }}
    />
  );
}

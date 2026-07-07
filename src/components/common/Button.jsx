
export default function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  isLoading = false,
  className = '',
  style = {},
  title
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const loadingClass = isLoading ? 'loading' : '';
  const fullClassName = `${baseClass} ${variantClass} ${loadingClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={fullClassName}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={style}
      title={title}
    >
      {isLoading ? (
        <>
          <span className="loading-spinner" aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

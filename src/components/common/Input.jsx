import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  placeholder,
  disabled = false,
  className = '',
  style = {},
  ...props
}, ref) => {
  return (
    <div className={`form-group ${className}`.trim()} style={style}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        className={`form-control ${error ? 'error' : ''}`.trim()}
        {...props}
      />
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

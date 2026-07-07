import { useEffect, useRef } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDestructive = false,
  isLoading = false
}) {
  const modalRef = useRef(null);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isLoading) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(focusableElementsString);
    if (focusableElements.length === 0) return;
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element initially
    setTimeout(() => firstFocusableElement.focus(), 50);

    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleFocusTrap);
    return () => modal.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Prevent closing if loading or if it is a destructive operation (for safety)
    if (isLoading) return;
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-container animate-scale-up" 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDestructive && (
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#fee2e2', 
                color: '#ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FiAlertTriangle size={20} />
              </div>
            )}
            <h2 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              {title}
            </h2>
          </div>

          {/* Modal Body */}
          <div style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {message}
          </div>

          {/* Modal Footer Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem', 
            marginTop: '1.5rem', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '1rem' 
          }} className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
              style={{ minWidth: '90px' }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={isDestructive ? "btn btn-danger" : "btn btn-primary"}
              onClick={onConfirm}
              disabled={isLoading}
              style={{ minWidth: '90px' }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: 'transparent' }}></span> Processing
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

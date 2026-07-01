import React, { useState } from 'react';
import { 
  FiBold, 
  FiItalic, 
  FiUnderline, 
  FiLink, 
  FiList, 
  FiAlignLeft, 
  FiAlignCenter, 
  FiAlignRight, 
  FiImage, 
  FiCode,
  FiTrash2
} from 'react-icons/fi';

export default function RichTextEditor({ value, onChange, placeholder, disabled, label, required }) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Format helper to insert characters at cursor position in the textarea
  const handleFormat = (type) => {
    if (disabled) return;
    
    let startTag = '';
    let endTag = '';
    
    switch (type) {
      case 'bold':
        startTag = '**';
        endTag = '**';
        break;
      case 'italic':
        startTag = '*';
        endTag = '*';
        break;
      case 'underline':
        startTag = '<u>';
        endTag = '</u>';
        break;
      case 'link':
        startTag = '[';
        endTag = '](url)';
        break;
      case 'list':
        startTag = '\n- ';
        break;
      case 'code':
        startTag = '`';
        endTag = '`';
        break;
      default:
        break;
    }

    const textarea = document.getElementById(`editor-${label?.replace(/\s+/g, '-').toLowerCase()}`);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);
      const replacement = startTag + selectedText + endTag;
      
      const newValue = text.substring(0, start) + replacement + text.substring(end);
      onChange(newValue);
      
      // Refocus textarea after action
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length);
      }, 50);
    }
  };

  const handleClear = () => {
    if (!disabled && window.confirm('Clear all text?')) {
      onChange('');
    }
  };

  const id = `editor-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {label} {required && <span className="required">*</span>}
          </span>
          {value && !disabled && (
            <button 
              type="button" 
              onClick={handleClear} 
              style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <FiTrash2 size={12} /> Clear Text
            </button>
          )}
        </label>
      )}
      
      <div 
        style={{ 
          border: isFocused ? '1px solid var(--primary)' : '1px solid #d1d5db', 
          borderRadius: '12px', 
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: isFocused ? '0 0 0 3px var(--primary-glow)' : 'var(--shadow-sm)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Editor Toolbar */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            padding: '6px 8px', 
            borderBottom: '1px solid #d1d5db', 
            background: '#f9fafb',
            flexWrap: 'wrap'
          }}
        >
          <button type="button" onClick={() => handleFormat('bold')} title="Bold" className="rte-toolbar-btn" disabled={disabled}><FiBold size={14} /></button>
          <button type="button" onClick={() => handleFormat('italic')} title="Italic" className="rte-toolbar-btn" disabled={disabled}><FiItalic size={14} /></button>
          <button type="button" onClick={() => handleFormat('underline')} title="Underline" className="rte-toolbar-btn" disabled={disabled}><FiUnderline size={14} /></button>
          <span className="rte-divider" />
          
          <button type="button" onClick={() => handleFormat('link')} title="Link" className="rte-toolbar-btn" disabled={disabled}><FiLink size={14} /></button>
          <button type="button" onClick={() => handleFormat('list')} title="Bullet List" className="rte-toolbar-btn" disabled={disabled}><FiList size={14} /></button>
          <button type="button" onClick={() => handleFormat('code')} title="Code" className="rte-toolbar-btn" disabled={disabled}><FiCode size={14} /></button>
          <span className="rte-divider" />

          <button type="button" title="Align Left" className="rte-toolbar-btn" disabled={disabled}><FiAlignLeft size={14} /></button>
          <button type="button" title="Align Center" className="rte-toolbar-btn" disabled={disabled}><FiAlignCenter size={14} /></button>
          <button type="button" title="Align Right" className="rte-toolbar-btn" disabled={disabled}><FiAlignRight size={14} /></button>
          <span className="rte-divider" />
          
          <button type="button" title="Insert Image" className="rte-toolbar-btn" disabled={disabled}><FiImage size={14} /></button>
        </div>

        {/* Text Area */}
        <textarea
          id={id}
          style={{ 
            border: 'none', 
            borderRadius: 0, 
            minHeight: '120px', 
            margin: 0, 
            background: 'transparent',
            outline: 'none',
            boxShadow: 'none',
            padding: '0.75rem 1rem',
            width: '100%',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            resize: 'vertical'
          }}
          placeholder={placeholder || 'Type here...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
}

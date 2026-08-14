import React, { useState, useEffect, useRef } from 'react';

/**
 * FloatingWidget Component
 * 
 * Enables:
 * - Free dragging anywhere on the screen with boundary protection
 * - Free dragging corner resize (width/height) + 3 Quick Size Presets (Compact, Standard, Expanded)
 * - Minimize / Maximize toggle
 * - LocalStorage persistence of position & dimensions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Avatar stage & player content
 * @param {React.ReactNode} props.footer - Subtitle bar
 * @param {React.ReactNode} props.headerActions - Customizer & dev triggers
 */
export function FloatingWidget({ children, footer, headerActions }) {
  // Load saved position & size from localStorage or default to center-right
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_widget_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      x: Math.max(20, window.innerWidth - 440),
      y: Math.max(20, (window.innerHeight - 560) / 2)
    };
  });

  const [size, setSize] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_widget_size');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { width: 380, height: 520 };
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [presetSize, setPresetSize] = useState('medium'); // 'small' | 'medium' | 'large'

  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0 });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('isl_widget_pos', JSON.stringify(position));
    } catch {}
  }, [position]);

  useEffect(() => {
    try {
      localStorage.setItem('isl_widget_size', JSON.stringify(size));
    } catch {}
  }, [size]);

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), window.innerWidth - size.width - 10),
        y: Math.min(Math.max(10, prev.y), window.innerHeight - (isMinimized ? 60 : size.height) - 10)
      }));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size, isMinimized]);

  // --- Drag Handlers ---
  const handleDragStart = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: position.x,
      startPosY: position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      const maxX = window.innerWidth - size.width - 8;
      const maxY = window.innerHeight - (isMinimized ? 60 : size.height) - 8;

      setPosition({
        x: Math.min(Math.max(8, dragRef.current.startPosX + deltaX), Math.max(8, maxX)),
        y: Math.min(Math.max(8, dragRef.current.startPosY + deltaY), Math.max(8, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, size, isMinimized]);

  // --- Resize Handlers ---
  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startW: size.width,
      startH: size.height
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const deltaX = clientX - resizeRef.current.startX;
      const deltaY = clientY - resizeRef.current.startY;

      const newWidth = Math.min(Math.max(280, resizeRef.current.startW + deltaX), 640);
      const newHeight = Math.min(Math.max(380, resizeRef.current.startH + deltaY), 780);

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  // Preset Sizes
  const applyPresetSize = (preset) => {
    setPresetSize(preset);
    if (preset === 'small') {
      setSize({ width: 300, height: 420 });
    } else if (preset === 'medium') {
      setSize({ width: 380, height: 520 });
    } else if (preset === 'large') {
      setSize({ width: 480, height: 620 });
    }
  };

  return (
    <div
      className={`floating-isl-widget ${isDragging ? 'is-dragging' : ''} ${isMinimized ? 'is-minimized' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`
      }}
    >
      {/* 1. Header Drag Bar */}
      <div className="widget-header-dragbar" onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
        <div className="drag-handle-indicator">
          <span className="drag-dots">⋮⋮</span>
          <span className="widget-title">ISL 2D Avatar</span>
        </div>

        {/* Quick Size Presets & Controls */}
        <div className="widget-controls no-drag">
          {!isMinimized && (
            <div className="size-preset-pills">
              <button
                className={`preset-pill ${presetSize === 'small' ? 'active' : ''}`}
                onClick={() => applyPresetSize('small')}
                title="Compact View (300px)"
              >
                S
              </button>
              <button
                className={`preset-pill ${presetSize === 'medium' ? 'active' : ''}`}
                onClick={() => applyPresetSize('medium')}
                title="Standard View (380px)"
              >
                M
              </button>
              <button
                className={`preset-pill ${presetSize === 'large' ? 'active' : ''}`}
                onClick={() => applyPresetSize('large')}
                title="Expanded View (480px)"
              >
                L
              </button>
            </div>
          )}

          <button
            className="ctrl-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand Avatar' : 'Minimize to bar'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* 2. Main Stage Content */}
      {!isMinimized && (
        <>
          <div className="widget-main-body">
            {children}
          </div>

          {/* 3. Footer Subtitle Bar */}
          <div className="widget-footer-area">
            {footer}
          </div>

          {/* 4. Bottom-Right Resize Grip Handle */}
          <div
            className="widget-resize-grip"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            title="Drag corner to freely resize"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM6 14H4V12H6V14ZM10 10H8V8H10V10Z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export default FloatingWidget;

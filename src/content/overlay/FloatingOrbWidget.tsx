// src/content/overlay/FloatingOrbWidget.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChromaticOrb } from '../../shared/components/ChromaticOrb';

interface FloatingOrbWidgetProps {
  hasSelection: boolean;
  isQuestion: boolean;
  selectedTextLength: number;
  isOverlayOpen: boolean;
  onToggle: () => void;
}

export const FloatingOrbWidget: React.FC<FloatingOrbWidgetProps> = ({
  hasSelection,
  isQuestion,
  selectedTextLength,
  isOverlayOpen,
  onToggle,
}) => {
  // Initialize position from saved storage or bottom-right corner
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const winW = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1200;
    const winH = typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 800;
    try {
      const saved = localStorage.getItem('snapreply_floating_orb_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number' &&
          parsed.x >= 0 &&
          parsed.x < winW &&
          parsed.y >= 0 &&
          parsed.y < winH
        ) {
          return {
            x: Math.min(Math.max(12, parsed.x), winW - 64),
            y: Math.min(Math.max(12, parsed.y), winH - 64),
          };
        }
      }
    } catch {
      // Ignore
    }
    return {
      x: Math.max(12, winW - 72),
      y: Math.max(12, winH - 84),
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number }>({
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
  });
  const hasMovedRef = useRef(false);

  // Keep orb within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(12, prev.x), (window.innerWidth || 1200) - 64),
        y: Math.min(Math.max(12, prev.y), (window.innerHeight || 800) - 64),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (clientX: number, clientY: number) => {
    dragStartRef.current = {
      pointerX: clientX,
      pointerY: clientY,
      startX: position.x,
      startY: position.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = currentX - dragStartRef.current.pointerX;
      const dy = currentY - dragStartRef.current.pointerY;

      if (!hasMovedRef.current && Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(12, dragStartRef.current.startX + dx), window.innerWidth - 64);
      const newY = Math.min(Math.max(12, dragStartRef.current.startY + dy), window.innerHeight - 64);

      setPosition({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (hasMovedRef.current) {
        setPosition((currentPos) => {
          try {
            localStorage.setItem('snapreply_floating_orb_pos', JSON.stringify(currentPos));
          } catch {
            // Ignore storage restriction
          }
          return currentPos;
        });
      } else {
        // Was a clean click, toggle overlay
        onToggle();
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  const tooltipText = hasSelection
    ? isQuestion
      ? '⚡ Answer Question with SnapReply'
      : `Reply to Selection (${selectedTextLength} chars)`
    : isOverlayOpen
    ? 'Close SnapReply'
    : 'Open SnapReply (Drag anywhere)';

  return (
    <>
      {/* Full-screen capture layer during drag to prevent iframe interference */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483645,
            cursor: 'grabbing',
            pointerEvents: 'auto',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 2147483646,
          touchAction: 'none',
        }}
        className="select-none pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sleek Hover Tooltip */}
        {isHovered && !isDragging && (
          <div
            style={{
              position: 'absolute',
              right: position.x > window.innerWidth / 2 ? '58px' : 'auto',
              left: position.x <= window.innerWidth / 2 ? '58px' : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#0a0a10]/95 backdrop-blur-xl border border-white/20 text-white text-xs font-medium shadow-2xl animate-fade-in pointer-events-none flex items-center gap-2"
          >
            {hasSelection && (
              <span
                className={`w-2 h-2 rounded-full ${
                  isQuestion ? 'bg-amber-400 animate-pulse' : 'bg-[#ff3b30]'
                }`}
              />
            )}
            <span>{tooltipText}</span>
          </div>
        )}

      <style>{`
        @property --sr-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes sr-border-rotate {
          to { --sr-angle: 360deg; }
        }
        .sr-orb-glow {
          position: relative;
        }
        .sr-orb-glow::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 9999px;
          padding: 1.5px;
          background: conic-gradient(
            from var(--sr-angle),
            rgba(103, 232, 249, 0.85),
            rgba(251, 191, 36, 0.85),
            rgba(249, 115, 22, 0.85),
            rgba(192, 132, 252, 0.85),
            rgba(103, 232, 249, 0.85)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: sr-border-rotate 2.8s linear infinite;
        }
        .sr-orb-glow:hover::before,
        .sr-orb-active::before {
          opacity: 1;
        }
      `}</style>

      {/* Main Draggable Circular Obsidian Orb */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handlePointerDown(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          const t = e.touches[0];
          handlePointerDown(t.clientX, t.clientY);
        }}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(8, 8, 12, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: hasSelection
            ? '1px solid rgba(255, 59, 48, 0.85)'
            : isOverlayOpen
            ? '1px solid rgba(251, 191, 36, 0.65)'
            : '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: hasSelection
            ? '0 0 24px rgba(255, 59, 48, 0.55), 0 10px 32px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            : isOverlayOpen
            ? '0 0 20px rgba(251, 191, 36, 0.35), 0 10px 32px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 8px 28px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.18s ease',
          userSelect: 'none',
        }}
        className={`sr-orb-glow relative transition-all duration-200 select-none ${
          hasSelection || isOverlayOpen ? 'sr-orb-active scale-105' : 'hover:scale-105 active:scale-95'
        }`}
        title={tooltipText}
        role="button"
        tabIndex={0}
      >
          {/* Animated Chromatic Liquid Orb */}
          <ChromaticOrb size={28} isGenerating={hasSelection && isQuestion} />

          {/* Red Badge when text is selected */}
          {hasSelection && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  backgroundColor: '#ff3b30',
                  opacity: 0.75,
                  animation: 'snapreply-breathe 1.5s infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  width: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  backgroundColor: '#ff3b30',
                  border: '2px solid #08080c',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(255, 59, 48, 0.9)',
                }}
              >
                {isQuestion ? '?' : '✓'}
              </span>
            </span>
          )}
        </div>
      </div>
    </>
  );
};

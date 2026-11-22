// src/content/overlay/QuickActionBubble.tsx
import React from 'react';
import { ChromaticOrb } from '../../shared/components/ChromaticOrb';

interface QuickActionBubbleProps {
  x: number;
  y: number;
  isQuestion?: boolean;
  label?: string;
  onOpen: () => void;
  onDismiss: () => void;
}

export const QuickActionBubble: React.FC<QuickActionBubbleProps> = ({
  x,
  y,
  isQuestion = false,
  label,
  onOpen,
  onDismiss,
}) => {
  const displayText = label || (isQuestion ? 'Answer Question with SnapReply...' : 'Reply with SnapReply...');

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)',
        zIndex: 2147483647,
      }}
      className="animate-island-pop select-none"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="snapreply-capsule group h-11 px-3.5 py-1.5 rounded-full flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-all duration-200"
      >
        {/* Iridescent Chromatic Orb */}
        <ChromaticOrb size={26} isGenerating={false} />

        {/* Text dynamically indicating question answering */}
        <span className="text-sm font-normal text-white/95 tracking-tight group-hover:text-white transition-colors">
          {displayText}
        </span>

        {/* Subtle dismiss */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
          title="Dismiss"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

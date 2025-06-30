import React, { useRef, useState } from 'react';
import WelcomeScreen from './WelcomeScreen';

interface WelcomeScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: () => void;
}

const WelcomeScreenModal: React.FC<WelcomeScreenModalProps> = ({ open, onOpenChange, onStartChat }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0, dragging: false });

  if (!open) return null;

  // Handlers para drag
  const onMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setDrag({
        ...drag,
        dragging: true,
        offsetX: e.clientX - drag.x,
        offsetY: e.clientY - drag.y
      });
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (drag.dragging) {
      setDrag({ ...drag, x: e.clientX - drag.offsetX, y: e.clientY - drag.offsetY, dragging: true });
    }
  };
  const onMouseUp = () => {
    setDrag({ ...drag, dragging: false });
  };

  // Centralização inicial com z-index alto
  const centerStyle: React.CSSProperties = drag.x === 0 && drag.y === 0 ? {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'fixed' as React.CSSProperties['position'],
    zIndex: 99999,
    width: '95vw',
    height: '90vh',
    maxWidth: '1200px',
    maxHeight: '800px',
    minWidth: '320px',
    minHeight: '400px',
    boxSizing: 'border-box'
  } : {
    top: drag.y,
    left: drag.x,
    position: 'fixed' as React.CSSProperties['position'],
    zIndex: 99999,
    width: '95vw',
    height: '90vh',
    maxWidth: '1200px',
    maxHeight: '800px',
    minWidth: '320px',
    minHeight: '400px',
    boxSizing: 'border-box'
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 99999 } as React.CSSProperties}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        ref={modalRef}
        className="rounded-lg shadow-2xl bg-background border border-border fixed-modal modal-content-stable flex flex-col"
        style={centerStyle}
      >
        <div
          className="cursor-move p-3 border-b border-border bg-muted rounded-t-lg select-none drag-handle flex items-center justify-between"
          onMouseDown={onMouseDown}
        >
          <span className="font-semibold flex items-center gap-2">
            🎉 Bem-vindo ao WhatsHub
          </span>
          <button
            className="text-xl px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded transition-colors"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <WelcomeScreen onStartChat={onStartChat} onOpenSettings={() => {}} isModal={true} />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreenModal;
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import type { DraggableEvent, DraggableData } from 'react-draggable';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  defaultPosition?: { x: number; y: number };
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  defaultPosition = { x: 0, y: 0 }
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const nodeRef = useRef<HTMLDivElement>(null);  const sizeClasses = {
    sm: 'w-96 h-96',
    md: 'w-[500px] h-[500px]',
    lg: 'w-[700px] h-[600px]',
    xl: 'w-[900px] h-[700px]'
  };

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <button 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm border-0 cursor-default" 
        onClick={onClose}
        aria-label="Fechar modal"
      />
      
      {/* Modal draggable */}
      <Draggable
        nodeRef={nodeRef}
        handle=".drag-handle"
        position={position}
        onDrag={handleDrag}
        disabled={isMaximized}
      >        <div
          className={cn(
            "bg-background border border-border rounded-lg shadow-2xl overflow-hidden relative fixed-modal",
            isMaximized 
              ? "fixed inset-4 w-auto h-auto" 
              : sizeClasses[size],
            !isMaximized && "draggable-modal-position",
            className
          )}
        >
        {/* Header com controles */}
        <div className="drag-handle flex items-center justify-between p-3 bg-muted/30 border-b border-border cursor-move">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm truncate">{title}</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMaximize}
                className="h-6 w-6 p-0 hover:bg-accent"
              >
                {isMaximized ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>          {/* Conteúdo */}
          <div className="flex-1 overflow-hidden modal-content-stable">
            {children}
          </div>
        </div>
      </Draggable>
    </div>
  );
};

import React from 'react';
import RealTimeMetrics from './RealTimeMetrics';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import VisuallyHidden from '@/components/ui/VisuallyHidden';

const MetricsModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>      <DialogContent className="stable-modal-content max-w-5xl w-full max-h-[95vh] overflow-hidden glass-card border-0 p-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Métricas em Tempo Real</DialogTitle>
          <DialogDescription>Modal com métricas em tempo real do sistema.</DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col h-full max-h-[95vh] overflow-hidden">
          {/* Header igual ao da dashboard principal */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-border/30 glass-effect bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 glass-card rounded-3xl flex items-center justify-center modern-button shadow-2xl">
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' /></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold gradient-text tracking-tight drop-shadow-lg">Métricas em Tempo Real</h2>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-primary text-3xl font-extrabold px-5 py-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-md bg-white/60 dark:bg-zinc-800/60">
              ×
            </button>
          </div>          {/* Conteúdo principal com padding e fundo igual ao dashboard */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 bg-gradient-to-br from-background via-muted/60 to-secondary/10 dark:from-zinc-900 dark:via-zinc-800/80 dark:to-secondary/10 modal-content-stable">
            <RealTimeMetrics noCard noPadding inModal />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricsModal;

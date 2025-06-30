import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import VisuallyHidden from '@/components/ui/VisuallyHidden';

interface DevModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DevModal: React.FC<DevModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="stable-modal-content max-w-4xl w-full p-0 overflow-hidden bg-black text-white rounded-2xl shadow-2xl border-0 modal-content-stable">
        <VisuallyHidden>
          <DialogTitle>Sobre o Desenvolvedor</DialogTitle>
        </VisuallyHidden>
        <iframe
          src="https://lucasmagista.carrd.co/"
          title="Sobre o Dev"
          className="w-full h-[80vh] border-0 rounded-2xl min-h-[500px]"
        />
      </DialogContent>
    </Dialog>
  );
};

export default DevModal;

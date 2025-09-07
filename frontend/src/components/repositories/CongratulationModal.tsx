'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type CongratulationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CongratulationModal({ isOpen, onClose }: CongratulationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
          bg-background/30 border-secondary/40 ring-primary/20 max-w-sm border text-center
          shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 backdrop-blur-lg
        `}
        showCloseButton={true}
      >
        <DialogHeader className="space-y-6">
          <DialogTitle
            className={`
              from-secondary to-primary bg-gradient-to-r bg-clip-text text-center text-2xl font-bold text-transparent
            `}
          >
            CONGRATULATIONS
          </DialogTitle>

          <div className="space-y-3 text-center">
            <p>All files have been typed in this repository.</p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

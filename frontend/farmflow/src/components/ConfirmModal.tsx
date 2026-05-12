import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center gap-6 py-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-500/10 text-red-500' : 
          variant === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
          'bg-primary/10 text-primary'
        }`}>
          <AlertTriangle size={32} />
        </div>
        
        <div>
          <p className="text-white/60 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-3 w-full mt-2">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            className="flex-1"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

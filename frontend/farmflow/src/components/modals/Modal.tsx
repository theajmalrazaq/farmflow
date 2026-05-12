import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children,
  maxWidth = 'max-w-2xl'
}) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      
      <div 
        className={`bg-[#0a0a0b] w-full ${maxWidth} rounded-[32px] border border-white/10 relative z-10 overflow-visible  animate-in zoom-in slide-in-from-bottom-8 duration-500 ease-out`}
      >
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] rounded-t-[32px]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-white/40 text-[13px] mt-0.5 font-medium">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/30 hover:text-white active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

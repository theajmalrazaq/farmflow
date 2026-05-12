import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { MapPin, Home, Building, Navigation } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string) => void;
  title?: string;
  initialValue?: string;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delivery Address",
  initialValue = ""
}) => {
  const [address, setAddress] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onConfirm(address);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Please provide your full delivery address for harvest shipment."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="relative group">
          <div className="absolute left-5 top-5 text-white/30 group-focus-within:text-primary transition-colors">
            <MapPin size={24} />
          </div>
          <textarea
            className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white font-medium transition-all resize-none"
            placeholder="House #, Street name, Area, City..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Home size={16} />, label: 'Home' },
            { icon: <Building size={16} />, label: 'Office' },
            { icon: <Navigation size={16} />, label: 'Other' }
          ].map((type) => (
            <button
              key={type.label}
              type="button"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/[0.08] transition-all group"
            >
              <div className="text-white/30 group-hover:text-primary transition-colors">
                {type.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                {type.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button 
            type="button"
            variant="secondary" 
            onClick={onClose} 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="flex-1"
            disabled={!address.trim()}
          >
            Confirm Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressModal;

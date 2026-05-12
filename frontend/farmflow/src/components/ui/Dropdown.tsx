import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Dropdown: React.FC<DropdownProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select option', 
  className = '',
  icon: LeadingIcon,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'h-11 px-4',
    md: 'h-12 px-5',
    lg: 'h-14 px-6'
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-full text-white font-bold hover:bg-white/10 hover:border-primary/30 transition-all focus:outline-none ${sizeClasses[size]}`}
      >
        <div className="flex items-center gap-3">
          {LeadingIcon && <span className="text-white/30">{LeadingIcon}</span>}
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={`text-sm ${selectedOption ? 'text-white' : 'text-white/40'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
 
      {isOpen && (
        <div className="absolute z-[110] mt-2 w-full min-w-[180px] bg-[#0a0a0b] backdrop-blur-3xl border border-white/10 rounded-[24px] p-1.5  animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
                  value === option.value 
                    ? 'bg-primary text-black font-black' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white font-bold'
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
                {value === option.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;

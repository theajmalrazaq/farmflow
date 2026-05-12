import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-primary text-black hover:brightness-110 active:scale-[0.98]',
      secondary: 'bg-white/5 text-white hover:bg-white/10 active:scale-[0.98] border border-white/10',
      outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5 active:scale-[0.98]',
      ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5 active:scale-[0.98]',
      danger: 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 active:scale-[0.98]',
      white: 'bg-white text-black hover:bg-white/90 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs font-bold  rounded-xl',
      md: 'px-6 py-3 text-sm font-bold  rounded-2xl',
      lg: 'px-8 py-4 text-base font-bold  rounded-[32px]',
      icon: 'w-11 h-11 flex items-center justify-center rounded-xl',
    };

    const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 font-bold';
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

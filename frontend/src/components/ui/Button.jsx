import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-[#235347] hover:bg-[#163832] text-[#DAF1DE] shadow-sm active:scale-[0.98]',
  secondary: 'bg-[#8EB69B] hover:bg-[#235347] text-[#051F20] hover:text-[#DAF1DE] border border-transparent active:scale-[0.98]',
  accent: 'bg-[#235347] hover:bg-[#163832] text-[#DAF1DE] shadow-sm active:scale-[0.98]',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-[0.98]',
  outline: 'border border-[#235347] text-[#235347] hover:bg-[#163832] hover:text-[#DAF1DE] transition-colors',
  ghost: 'text-[#235347] hover:bg-[#163832]/20 hover:text-[#051F20] transition-colors',
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs font-medium gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-base font-semibold gap-2.5 rounded-xl',
};

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled = false,
      fullWidth = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyle =
      'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none';

    const appliedVariant = variantClasses[variant] || variantClasses.primary;
    const appliedSize = sizeClasses[size] || sizeClasses.md;
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${appliedVariant} ${appliedSize} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : LeftIcon ? (
          <LeftIcon className="w-4 h-4 shrink-0" />
        ) : null}

        {children && <span>{children}</span>}

        {!isLoading && RightIcon ? <RightIcon className="w-4 h-4 shrink-0" /> : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

import React from 'react';

export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={`p-4 sm:p-6 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between gap-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3
    className={`text-lg font-bold font-display text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p
    className={`text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5 ${className}`}
    {...props}
  >
    {children}
  </p>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-4 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={`p-4 sm:p-6 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50/50 rounded-b-2xl flex items-center justify-end gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Card = ({
  children,
  className = '',
  hoverGlow = false,
  variant = 'glass',
  onClick,
  ...props
}) => {
  const variantStyles = {
    glass: 'glass-card',
    kpi: 'kpi-card',
    solid:
      'bg-[#163832] border border-transparent shadow-lg rounded-2xl text-[#DAF1DE]',
    outline:
      'bg-transparent border border-[#235347] rounded-2xl',
  };

  const glowStyle = hoverGlow
    ? 'transition-all duration-300 hover:border-accent-subtle hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-0.5'
    : '';

  const clickableStyle = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${variantStyles[variant] || variantStyles.glass} ${glowStyle} ${clickableStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

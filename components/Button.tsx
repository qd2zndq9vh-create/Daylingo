import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'locked';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "font-black text-sm sm:text-base uppercase tracking-widest rounded-2xl py-3.5 px-6 transition-all transform active:scale-[0.96] flex items-center justify-center shadow-lg";
  
  const variants = {
    // Primary: Deep Navy with lighter top gradient
    primary: "bg-navy text-white border-b-[6px] border-navy-dark active:border-b-0 active:translate-y-[6px] hover:brightness-110",
    
    // Secondary: Clean White/Slate
    secondary: "bg-white text-navy border-2 border-slate-200 border-b-[6px] active:border-b-2 active:translate-y-[4px] hover:bg-slate-50",
    
    // Danger: Vibrant Red
    danger: "bg-danger text-white border-b-[6px] border-danger-dark active:border-b-0 active:translate-y-[6px] hover:brightness-110",
    
    ghost: "bg-transparent text-navy hover:bg-navy/5 border-0 shadow-none active:scale-95",
    
    // Locked: Flat Slate
    locked: "bg-slate-200 text-slate-400 border-b-[6px] border-slate-300 cursor-not-allowed active:none active:translate-y-0 shadow-none"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      disabled={disabled || variant === 'locked'}
      {...props}
    >
      {children}
    </button>
  );
};
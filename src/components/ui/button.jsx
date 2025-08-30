import React from 'react';
import { cn } from '../../utils';

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  disabled = false,
  children,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-teal-400 text-gray-900 hover:bg-teal-500",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-700 bg-transparent hover:bg-gray-700 hover:text-white",
    secondary: "bg-gray-700 text-gray-100 hover:bg-gray-600",
    ghost: "hover:bg-gray-700 hover:text-white",
    link: "underline-offset-4 hover:underline text-teal-400"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button }; 
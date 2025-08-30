import React from 'react';
import { cn } from '../../utils';

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" && "border-transparent bg-teal-400 text-gray-900 hover:bg-teal-500",
      variant === "secondary" && "border-transparent bg-gray-700 text-gray-100 hover:bg-gray-600",
      variant === "destructive" && "border-transparent bg-red-500 text-white hover:bg-red-600",
      variant === "outline" && "text-gray-100",
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge }; 
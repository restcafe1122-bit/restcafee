import React from 'react';
import { cn } from '../../utils';

const Select = React.forwardRef(({ className, children, value, onChange, ...props }, ref) => (
  <select
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    value={value}
    onChange={onChange}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <option
    className={cn("text-gray-900 bg-white", className)}
    ref={ref}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectItem }; 
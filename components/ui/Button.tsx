import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 relative overflow-hidden";

    const variants = {
      primary: "bg-gradient-to-r from-cousin-purple to-cousin-pink text-white hover:shadow-lg hover:scale-105 focus:ring-cousin-purple",
      secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
      success: "bg-gradient-to-r from-cousin-green to-cousin-blue text-white hover:shadow-lg hover:scale-105 focus:ring-cousin-green",
      danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-105 focus:ring-red-500",
      outline: "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
      gradient: "bg-gradient-to-r from-cousin-purple via-cousin-blue to-cousin-pink text-white hover:shadow-xl hover:scale-105 focus:ring-cousin-purple animate-gradient",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-xl",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
      icon: "p-3 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };

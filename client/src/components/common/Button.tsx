import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-white hover:to-white hover:text-gray-900 text-white border border-gray-700 hover:border-gray-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    secondary:
      "bg-gray-600 hover:bg-gray-700 text-white border border-gray-500 hover:border-gray-400",
    danger:
      "bg-red-600 hover:bg-red-700 text-white border border-red-500 hover:border-red-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    success:
      "bg-green-600 hover:bg-green-700 text-white border border-green-500 hover:border-green-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} flex items-center justify-center rounded-lg font-medium  ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
};

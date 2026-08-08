import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-none font-bold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[#FFB800] text-black hover:bg-[#FFD166] shadow-[0_0_20px_rgba(255,184,0,0.4)] hover:shadow-[0_0_35px_rgba(255,184,0,0.6)] active:scale-95",
      secondary:
        "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] active:scale-95",
      outline:
        "border-2 border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-black active:scale-95",
      ghost: "hover:bg-white/10 hover:text-white text-gray-400 active:scale-95",
    };

    const sizes = {
      sm: "h-9 px-5 text-xs",
      md: "h-11 px-8 text-sm",
      lg: "h-14 px-10 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

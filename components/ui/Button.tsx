import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:   "bg-green-500 text-white hover:bg-green-700 disabled:opacity-50",
    secondary: "bg-[#F7F6F2] text-foreground hover:bg-cream-300 border border-black/[0.07]",
    outline:   "border border-black/[0.12] text-foreground hover:bg-cream-200 bg-white",
    ghost:     "text-muted-foreground hover:text-foreground hover:bg-cream-200",
    danger:    "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  };

  const sizes = {
    sm: "text-[12px] px-3 py-1.5 gap-1.5",
    md: "text-[13px] px-4 py-2.5 gap-2",
    lg: "text-[14px] px-5 py-3 gap-2",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

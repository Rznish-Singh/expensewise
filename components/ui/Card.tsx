import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddingMap = {
    none: "",
    sm:   "p-4",
    md:   "p-5",
    lg:   "p-6",
  };

  return (
    <div
      className={cn(
        "bg-white border border-black/[0.07] rounded-xl",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-5", className)}>
      <h3 className="text-[14px] font-medium text-foreground">{title}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function CardActionButton({ children, onClick }: CardActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-[12px] text-muted-foreground bg-[#F7F6F2] border border-black/[0.07] rounded-md px-2.5 py-1 hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

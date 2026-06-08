import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6 gap-4 flex-wrap", className)}>
      <div>
        <h1 className="font-serif text-[26px] font-light text-foreground leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2.5 flex-shrink-0">{children}</div>
      )}
    </div>
  );
}

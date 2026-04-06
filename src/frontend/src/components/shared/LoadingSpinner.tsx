import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`${sizeClass} animate-spin text-primary`} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusToggleButtonProps {
  status: "planned" | "completed";
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function StatusToggleButton({
  status,
  onToggle,
  disabled = false,
  size = "md",
}: StatusToggleButtonProps) {
  const isCompleted = status === "completed";
  const isLoading = disabled;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-11 w-11", // 44px for touch-friendly
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        "flex-shrink-0 rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        isCompleted
          ? "bg-income border-2 border-income text-white"
          : "border-2 border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/10 group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label={isCompleted ? "Marcar como pendente" : "Marcar como pago"}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : isCompleted ? (
        <Check className={iconSizes[size]} />
      ) : (
        <Check className={cn(iconSizes[size], "opacity-0 group-hover:opacity-30 text-primary transition-opacity")} />
      )}
    </button>
  );
}

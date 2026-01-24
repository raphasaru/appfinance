"use client";

import Link from "next/link";
import { Receipt, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: "primary" | "secondary";
}

const defaultActions: QuickAction[] = [
  {
    label: "FATURAS",
    href: "/transacoes?type=expense",
    icon: <Receipt className="h-5 w-5" />,
    color: "primary",
  },
  {
    label: "METAS",
    href: "/orcamento",
    icon: <Target className="h-5 w-5" />,
    color: "secondary",
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActions({ actions = defaultActions, className }: QuickActionsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {actions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className={cn(
            "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200",
            action.color === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary-light shadow-sm"
              : "bg-card text-foreground border border-border hover:bg-accent"
          )}
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}

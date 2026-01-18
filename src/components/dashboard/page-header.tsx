"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PageHeaderProps {
  title: string;
  currentMonth?: Date;
  onMonthChange?: (month: Date) => void;
  showMonthSelector?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  currentMonth,
  onMonthChange,
  showMonthSelector = true,
  action,
}: PageHeaderProps) {
  const monthLabel = currentMonth
    ? format(currentMonth, "MMMM yyyy", { locale: ptBR })
    : "";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {showMonthSelector && currentMonth && (
          <p className="text-muted-foreground mt-1 hidden md:block">
            Visualizando dados de {monthLabel}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showMonthSelector && currentMonth && onMonthChange && (
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
              <Calendar className="h-4 w-4 text-muted-foreground hidden md:block" />
              <span className="text-sm font-medium capitalize">{monthLabel}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {action}
      </div>
    </div>
  );
}

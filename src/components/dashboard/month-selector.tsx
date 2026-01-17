"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMonthChange(subMonths(currentMonth, 1))}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

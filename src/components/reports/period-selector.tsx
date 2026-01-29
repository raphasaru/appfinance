"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, X } from "lucide-react";

export type PeriodType =
  | "today"
  | "yesterday"
  | "last_3_days"
  | "last_7_days"
  | "this_month"
  | "last_month"
  | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

interface PeriodSelectorProps {
  value: PeriodType;
  dateRange: DateRange;
  onChange: (period: PeriodType, dateRange: DateRange) => void;
}

const periodLabels: Record<PeriodType, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  last_3_days: "Últimos 3 dias",
  last_7_days: "Últimos 7 dias",
  this_month: "Mês atual",
  last_month: "Mês anterior",
  custom: "Personalizado",
};

export function getPeriodDateRange(period: PeriodType): DateRange {
  const now = new Date();

  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "yesterday":
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case "last_3_days":
      return { start: startOfDay(subDays(now, 2)), end: endOfDay(now) };
    case "last_7_days":
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month":
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    case "custom":
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

export function formatPeriodLabel(period: PeriodType, dateRange: DateRange): string {
  if (period === "custom") {
    const startStr = format(dateRange.start, "dd/MM", { locale: ptBR });
    const endStr = format(dateRange.end, "dd/MM", { locale: ptBR });
    return `${startStr} - ${endStr}`;
  }
  return periodLabels[period];
}

export function PeriodSelector({ value, dateRange, onChange }: PeriodSelectorProps) {
  const [customStart, setCustomStart] = useState(format(dateRange.start, "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(dateRange.end, "yyyy-MM-dd"));

  useEffect(() => {
    if (value === "custom") {
      setCustomStart(format(dateRange.start, "yyyy-MM-dd"));
      setCustomEnd(format(dateRange.end, "yyyy-MM-dd"));
    }
  }, [value, dateRange]);

  const handlePeriodChange = (newPeriod: PeriodType) => {
    if (newPeriod === "custom") {
      onChange(newPeriod, dateRange);
    } else {
      onChange(newPeriod, getPeriodDateRange(newPeriod));
    }
  };

  const handleCustomDateChange = (type: "start" | "end", dateStr: string) => {
    if (type === "start") {
      setCustomStart(dateStr);
    } else {
      setCustomEnd(dateStr);
    }
  };

  const applyCustomDates = () => {
    const start = new Date(customStart + "T00:00:00");
    const end = new Date(customEnd + "T23:59:59");
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      onChange("custom", { start, end });
    }
  };

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={(v) => handlePeriodChange(v as PeriodType)}>
        <SelectTrigger className="w-full md:w-[200px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(periodLabels) as PeriodType[]).map((period) => (
            <SelectItem key={period} value={period}>
              {periodLabels[period]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value === "custom" && (
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Até</label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="w-full"
            />
          </div>
          <Button size="sm" onClick={applyCustomDates}>
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}

interface PeriodBadgeProps {
  period: PeriodType;
  dateRange: DateRange;
  onClear?: () => void;
}

export function PeriodBadge({ period, dateRange, onClear }: PeriodBadgeProps) {
  const label = formatPeriodLabel(period, dateRange);

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
      <Calendar className="h-3 w-3" />
      <span>{label}</span>
      {onClear && (
        <button
          onClick={onClear}
          className="ml-1 hover:bg-primary/20 rounded p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

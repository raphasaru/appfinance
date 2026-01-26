"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCategoryLabel, ExpenseCategory } from "@/lib/utils/categories";
import { formatCurrency } from "@/lib/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

// Category colors for the pie chart
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fixed_housing: "#3B82F6",     // blue
  fixed_utilities: "#F59E0B",   // amber
  fixed_subscriptions: "#8B5CF6", // purple
  fixed_personal: "#EC4899",    // pink
  fixed_taxes: "#6B7280",       // gray
  variable_credit: "#F97316",   // orange
  variable_food: "#22C55E",     // green
  variable_transport: "#06B6D4", // cyan
  variable_other: "#64748B",    // slate
};

interface CategoryData {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  isLoading?: boolean;
}

export function CategoryPieChart({ data, isLoading }: CategoryPieChartProps) {
  const chartData = data.map((item) => ({
    name: getCategoryLabel(item.category),
    value: item.amount,
    category: item.category,
    percentage: item.percentage,
  }));

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">Nenhuma despesa neste mês</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Despesas por Categoria</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {chartData.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                />
                <span className="flex-1 text-sm truncate">{item.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums w-12 text-right">
                  {Math.round(item.percentage)}%
                </span>
                <span className="text-sm font-medium currency w-24 text-right">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            {/* Total */}
            <div className="pt-2 mt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-semibold currency text-expense">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

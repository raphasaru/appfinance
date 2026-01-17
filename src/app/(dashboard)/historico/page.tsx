"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { useMonthlyHistory, useCategoryBreakdown } from "@/lib/hooks/use-history";
import { formatCurrency } from "@/lib/utils/currency";
import { getCategoryLabel } from "@/lib/utils/categories";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4A6741", "#2D7A4F", "#6B8C5F", "#D4A84B", "#C45C4A", "#8BA882", "#E4B85B", "#D4736A", "#5A7A51"];

export default function HistoricoPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: history, isLoading: historyLoading } = useMonthlyHistory(6);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryBreakdown(currentMonth);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Histórico</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value) || 0)}
                  labelStyle={{ color: "#1A1A18" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E8E3",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="income" name="Receitas" fill="#2D7A4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Despesas" fill="#C45C4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryLoading ? (
            <div className="h-48 bg-muted animate-pulse rounded" />
          ) : categoryData && categoryData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8E8E3",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2">
                {categoryData.slice(0, 5).map((item, index) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 text-sm truncate">
                      {getCategoryLabel(item.category as any)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(item.percentage)}%
                    </span>
                    <span className="text-sm font-medium currency">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma despesa neste mês</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

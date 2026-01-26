"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { useMonthlyHistory, useCategoryBreakdown } from "@/lib/hooks/use-history";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { formatCurrency } from "@/lib/utils/currency";
import { getCategoryLabel } from "@/lib/utils/categories";
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
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
  Legend,
} from "recharts";

const COLORS = ["#4A6741", "#2D7A4F", "#6B8C5F", "#D4A84B", "#C45C4A", "#8BA882", "#E4B85B", "#D4736A", "#5A7A51"];

export default function HistóricoPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: history, isLoading: historyLoading } = useMonthlyHistory(6);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryBreakdown(currentMonth);
  const { data: summary } = useMonthlySummary(currentMonth);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="p-4 md:hidden">
        <h1 className="text-xl font-semibold">Histórico</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          title="Histórico"
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>

      {/* Main Chart - Full Width */}
      <div className="px-4 md:px-0">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base md:text-lg">Evolução dos Últimos 6 Meses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="h-48 md:h-72 bg-muted animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={isDesktop ? 300 : 200}>
                <BarChart data={history} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    labelStyle={{ color: "#1A1A18", fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8E8E3",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    dataKey="income"
                    name="Receitas"
                    fill="#2D7A4F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Despesas"
                    fill="#C45C4A"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Month Selector */}
      <div className="md:hidden">
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      {/* Desktop Grid: Pie Chart + Summary */}
      <div className="px-4 md:px-0 md:grid md:grid-cols-2 gap-6 space-y-4 md:space-y-0">
        {/* Pie Chart Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base md:text-lg">Despesas por Categoria</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="h-64 bg-muted animate-pulse rounded" />
            ) : categoryData && categoryData.length > 0 ? (
              <div className="flex flex-col gap-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
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
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {categoryData.slice(0, 5).map((item, index) => (
                    <div key={item.category} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="flex-1 text-sm truncate">
                        {getCategoryLabel(item.category as any)}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {Math.round(item.percentage)}%
                      </span>
                      <span className="text-sm font-medium currency w-24 text-right">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma despesa neste mês</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Income */}
            <div className="p-4 rounded-lg bg-income/5 border border-income/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-income/10">
                  <TrendingUp className="h-4 w-4 text-income" />
                </div>
                <span className="text-sm font-medium">Total de Receitas</span>
              </div>
              <p className="text-2xl font-bold currency text-income">
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(summary?.completedIncome || 0)} recebido
              </p>
            </div>

            {/* Expenses */}
            <div className="p-4 rounded-lg bg-expense/5 border border-expense/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-expense/10">
                  <TrendingDown className="h-4 w-4 text-expense" />
                </div>
                <span className="text-sm font-medium">Total de Despesas</span>
              </div>
              <p className="text-2xl font-bold currency text-expense">
                {formatCurrency(summary?.totalExpenses || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(summary?.completedExpenses || 0)} pago
              </p>
            </div>

            {/* Balance */}
            <div className={cn(
              "p-4 rounded-lg border",
              (summary?.balance || 0) >= 0
                ? "bg-income/5 border-income/10"
                : "bg-expense/5 border-expense/10"
            )}>
              <span className="text-sm font-medium">Saldo Previsto</span>
              <p className={cn(
                "text-3xl font-bold currency mt-1",
                (summary?.balance || 0) >= 0 ? "text-income" : "text-expense"
              )}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

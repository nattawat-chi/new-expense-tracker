"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  Download,
} from "lucide-react";
import { ProtectedRoute, ErrorBoundary } from "@/components/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { formatDate } from "@/lib/utils";
import {
  getMonthlyReport,
  getYearlyReport,
  exportTransactions,
  getCategoryStats,
  getTopSpendingCategories,
  getTransactionStats,
} from "@/lib/api";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
];

interface MonthlyReport {
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    income: { total: number; count: number; average: number };
    expense: { total: number; count: number; average: number };
    net: number;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    type: string;
    totalAmount: number;
    count: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    income: number;
    expense: number;
    incomeCount: number;
    expenseCount: number;
  }>;
}

interface YearlyReport {
  period: {
    year: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    income: { total: number; count: number; average: number };
    expense: { total: number; count: number; average: number };
    net: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    monthName: string;
    income: number;
    expense: number;
    net: number;
    count: number;
  }>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    type: string;
    totalAmount: number;
    count: number;
  }>;
}

interface CategoryReport {
  categoryId: string;
  categoryName: string;
  type: string;
  totalAmount: number;
  count: number;
  percentage: number;
  monthlyAverage: number;
  trend: "up" | "down" | "stable";
}

export default function ReportsPage() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null
  );
  const [yearlyReport, setYearlyReport] = useState<YearlyReport | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryReport[]>([]);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      const data = await getMonthlyReport(accessToken, {
        year: selectedYear,
        month: selectedMonth,
      });

      setMonthlyReport(data);
    } catch (error) {
      console.error("Error fetching monthly report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyReport = async () => {
    setLoading(true);
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      const data = await getYearlyReport(accessToken, {
        year: selectedYear,
      });

      setYearlyReport(data);
    } catch (error) {
      console.error("Error fetching yearly report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryReport = async () => {
    setLoading(true);
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      // ลองใช้ transaction stats แทน เพื่อดูว่ามีข้อมูลหรือไม่
      const transactionStats = await getTransactionStats(accessToken, {
        startDate: new Date(selectedYear, 0, 1).toISOString(),
        endDate: new Date(selectedYear, 11, 31).toISOString(),
      });

      console.log("Transaction stats:", transactionStats); // Debug log

      // ใช้ yearly report แทน เพราะมี category breakdown อยู่แล้ว
      const yearlyData = await getYearlyReport(accessToken, {
        year: selectedYear,
      });

      console.log("Yearly data:", yearlyData); // Debug log

      if (yearlyData?.categoryBreakdown) {
        console.log("Category breakdown:", yearlyData.categoryBreakdown); // Debug log

        // คำนวณยอดรวมทั้งหมดเพื่อหาสัดส่วน
        const totalExpense = yearlyData.categoryBreakdown
          .filter((cat: any) => cat.type === "EXPENSE")
          .reduce(
            (sum: number, cat: any) => sum + Number(cat.totalAmount || 0),
            0
          );

        console.log("Total expense:", totalExpense); // Debug log

        // Process category data
        const processedCategories = yearlyData.categoryBreakdown.map(
          (cat: any) => {
            const totalAmount = Number(cat.totalAmount) || 0;
            const percentage =
              totalExpense > 0 ? (totalAmount / totalExpense) * 100 : 0;

            const processed = {
              categoryId: cat.categoryId || "",
              categoryName: cat.categoryName || "Unspecified",
              type: cat.type || "EXPENSE",
              totalAmount: totalAmount,
              count: Number(cat.count) || 0,
              percentage: percentage,
              monthlyAverage: totalAmount / 12,
              trend: "stable", // ยังไม่มีข้อมูล trend
            };

            console.log("Processed category:", processed); // Debug log
            return processed;
          }
        );

        setCategoryReport(processedCategories);
      } else {
        console.log("No category breakdown found"); // Debug log
        setCategoryReport([]);
      }
    } catch (error) {
      console.error("Error fetching category report:", error);
      setCategoryReport([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "monthly") {
      fetchMonthlyReport();
    } else if (activeTab === "yearly") {
      fetchYearlyReport();
    } else if (activeTab === "category") {
      fetchCategoryReport();
    }
  }, [activeTab, selectedYear, selectedMonth]);

  const monthlyChartData = useMemo(() => {
    if (!monthlyReport?.dailyBreakdown) return [];
    return monthlyReport.dailyBreakdown.map((day) => ({
      date: formatDate(day.date, "th-TH", { day: "numeric", month: "short" }),
      income: day.income,
      expense: day.expense,
    }));
  }, [monthlyReport]);

  const monthlyCategoryData = useMemo(() => {
    if (!monthlyReport?.categoryBreakdown) return [];
    return monthlyReport.categoryBreakdown
      .filter((cat) => cat.type === "EXPENSE")
      .map((cat, index) => ({
        name: cat.categoryName,
        value: Number(cat.totalAmount),
        color: COLORS[index % COLORS.length],
      }));
  }, [monthlyReport]);

  const yearlyChartData = useMemo(() => {
    if (!yearlyReport?.monthlyBreakdown) return [];
    return yearlyReport.monthlyBreakdown.map((month) => ({
      month: month.monthName,
      income: Number(month.income),
      expense: Number(month.expense),
      net: Number(month.net),
    }));
  }, [yearlyReport]);

  const yearlyCategoryData = useMemo(() => {
    if (!yearlyReport?.categoryBreakdown) return [];
    return yearlyReport.categoryBreakdown
      .filter((cat) => cat.type === "EXPENSE")
      .slice(0, 10)
      .map((cat, index) => ({
        name: cat.categoryName,
        value: Number(cat.totalAmount),
        color: COLORS[index % COLORS.length],
      }));
  }, [yearlyReport]);

  const categoryChartData = useMemo(() => {
    if (!categoryReport.length) return [];
    return categoryReport
      .filter((cat) => cat.type === "EXPENSE")
      .slice(0, 10)
      .map((cat, index) => ({
        name: cat.categoryName || "Unspecified",
        value: cat.totalAmount || 0,
        color: COLORS[index % COLORS.length],
      }));
  }, [categoryReport]);

  const categoryBarData = useMemo(() => {
    if (!categoryReport.length) return [];
    return categoryReport
      .filter((cat) => cat.type === "EXPENSE")
      .slice(0, 8)
      .map((cat) => ({
        category: cat.categoryName || "Unspecified",
        total: cat.totalAmount || 0,
        count: cat.count || 0,
        monthlyAverage: cat.monthlyAverage || 0,
      }));
  }, [categoryReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const handleExport = async (type: "monthly" | "yearly") => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      const params = {
        format: "csv",
        ...(type === "monthly" && { year: selectedYear, month: selectedMonth }),
        ...(type === "yearly" && { year: selectedYear }),
      };

      const blob = await exportTransactions(accessToken, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${type}-${selectedYear}${
        type === "monthly" ? `-${selectedMonth + 1}` : ""
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen flex bg-background">
          <DashboardSidebar clerkUser={clerkUser} />
          <main className="flex-1 p-8 bg-background overflow-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1 text-foreground">
                  Reports and Analysis
                </h1>
                <p className="text-muted-foreground">
                  See your financial statistics and trends 📊
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="monthly"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Yearly
                </TabsTrigger>
                <TabsTrigger
                  value="category"
                  className="flex items-center gap-2"
                >
                  <PieChartIcon className="h-4 w-4" />
                  By Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number(value))}
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleExport("monthly")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                ) : monthlyReport ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Income
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              Number(monthlyReport.summary.income.total)
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {monthlyReport.summary.income.count} transactions
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Expense
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(
                              Number(monthlyReport.summary.expense.total)
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {monthlyReport.summary.expense.count} transactions
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${
                              monthlyReport.summary.net >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(monthlyReport.summary.net)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Income - Expense
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Daily Income vs Expense</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                              <Legend />
                              <Bar dataKey="income" fill="#10B981" />
                              <Bar dataKey="expense" fill="#EF4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Spending by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={monthlyCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {monthlyCategoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No report data
                  </div>
                )}
              </TabsContent>

              <TabsContent value="yearly" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleExport("yearly")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                ) : yearlyReport ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Income
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              Number(yearlyReport.summary.income.total)
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {yearlyReport.summary.income.count} transactions
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Expense
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(
                              Number(yearlyReport.summary.expense.total)
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {yearlyReport.summary.expense.count} transactions
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${
                              yearlyReport.summary.net >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(yearlyReport.summary.net)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Income - Expense
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Income vs Expense</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yearlyChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                              <Legend />
                              <Bar dataKey="income" fill="#10B981" />
                              <Bar dataKey="expense" fill="#EF4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Spending by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={yearlyCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {yearlyCategoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Monthly Trend Line Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Net Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={yearlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) =>
                                formatCurrency(Number(value))
                              }
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="net"
                              stroke="#3B82F6"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No report data
                  </div>
                )}
              </TabsContent>

              <TabsContent value="category" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleExport("yearly")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                ) : categoryReport.length > 0 ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Categories
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            {categoryReport.length}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Categories with transactions
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Expense
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(
                              categoryReport
                                .filter((cat) => cat.type === "EXPENSE")
                                .reduce(
                                  (sum, cat) => sum + (cat.totalAmount || 0),
                                  0
                                )
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">All</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Transactions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {categoryReport.reduce(
                              (sum, cat) => sum + (cat.count || 0),
                              0
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">All</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Spending by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={categoryChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {categoryChartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Spending by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryBarData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" />
                              <YAxis />
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(Number(value))
                                }
                              />
                              <Legend />
                              <Bar dataKey="total" fill="#EF4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Category Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Category</th>
                                <th className="text-right py-2">Total</th>
                                <th className="text-right py-2">
                                  Transactions
                                </th>
                                <th className="text-right py-2">
                                  Monthly Average
                                </th>
                                <th className="text-right py-2">Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryReport
                                .filter((cat) => cat.type === "EXPENSE")
                                .sort((a, b) => b.totalAmount - a.totalAmount)
                                .map((cat, index) => (
                                  <tr
                                    key={cat.categoryId || `category-${index}`}
                                    className="border-b"
                                  >
                                    <td className="py-2">
                                      {cat.categoryName || "Unspecified"}
                                    </td>
                                    <td className="text-right py-2">
                                      {formatCurrency(cat.totalAmount || 0)}
                                    </td>
                                    <td className="text-right py-2">
                                      {cat.count || 0}
                                    </td>
                                    <td className="text-right py-2">
                                      {formatCurrency(cat.monthlyAverage || 0)}
                                    </td>
                                    <td className="text-right py-2">
                                      {(cat.percentage || 0).toFixed(1)}%
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No category report data
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

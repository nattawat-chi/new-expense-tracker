"use client";
import { useUser, useAuth, SignOutButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Progress,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui";
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
  LineChart,
  Line,
} from "recharts";
import {
  HomeIcon,
  FileText,
  Clock,
  User,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
} from "lucide-react";
import {
  useTransactions,
  useAccounts,
  useCategories,
  useBudgets,
  useBudgetAlerts,
  useTransactionStats,
  useTopSpendingCategories,
  useMonthlyReport,
} from "@/lib/hooks";
import {
  createCategory,
  createTransaction,
  createAccount,
  createBudget,
  updateTransaction,
  deleteTransaction,
  updateCategory,
  deleteCategory,
  exportTransactions,
} from "@/lib/api";

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
];

function AddCategoryModal({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "EXPENSE" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          <Plus /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const accessToken = await getToken();
              if (!accessToken) {
                setError("No access token");
                setLoading(false);
                return;
              }
              await createCategory(form, accessToken);
              setOpen(false);
              setForm({ name: "", type: "EXPENSE" });
              onAdded?.();
            } catch (err: any) {
              setError(err?.message || "Error");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Category Name"
            required
          />
          <Select
            name="type"
            value={form.type}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddTransactionModal({ onAdded }: { onAdded?: () => void }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    accountId: "",
    type: "EXPENSE",
  });
  const [loading, setLoading] = useState(false);
  const { categories, loading: catLoading } = useCategories();
  const { accounts, loading: accLoading } = useAccounts();

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          <Plus /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const accessToken = await getToken();
            if (!accessToken) {
              setLoading(false);
              return;
            }
            const txData = {
              ...form,
              amount: Number(form.amount),
            };
            await createTransaction(txData, accessToken);
            setLoading(false);
            setOpen(false);
            setForm({
              amount: "",
              description: "",
              date: new Date().toISOString().split("T")[0],
              categoryId: "",
              accountId: "",
              type: "EXPENSE",
            });
            onAdded?.();
          }}
          className="space-y-4"
        >
          <Select
            name="type"
            value={form.type}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">รายจ่าย</SelectItem>
              <SelectItem value="INCOME">รายรับ</SelectItem>
            </SelectContent>
          </Select>
          <Input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
            type="number"
            min="0"
            step="0.01"
          />
          <Input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
          />
          <Input
            name="date"
            value={form.date}
            onChange={handleChange}
            placeholder="Date"
            type="date"
            required
          />
          <Select
            name="categoryId"
            value={form.categoryId || "ALL"}
            onValueChange={(value: string) =>
              setForm((f) => ({
                ...f,
                categoryId: value === "ALL" ? "" : value,
              }))
            }
            disabled={catLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(categories) &&
                categories
                  .filter((cat: any) => cat.type === form.type)
                  .map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          <Select
            name="accountId"
            value={form.accountId}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, accountId: value }))
            }
            disabled={accLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(accounts) &&
                accounts.map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddBudgetModal({ onAdded }: { onAdded?: () => void }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const { categories, loading: catLoading } = useCategories();

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          <Plus /> ตั้งงบประมาณ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>ตั้งงบประมาณใหม่</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const accessToken = await getToken();
            if (!accessToken) {
              setLoading(false);
              return;
            }
            const budgetData = {
              ...form,
              amount: Number(form.amount),
              categoryId: form.categoryId || undefined,
            };
            await createBudget(budgetData, accessToken);
            setLoading(false);
            setOpen(false);
            setForm({
              amount: "",
              startDate: new Date().toISOString().split("T")[0],
              endDate: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
              )
                .toISOString()
                .split("T")[0],
              categoryId: "",
            });
            onAdded?.();
          }}
          className="space-y-4"
        >
          <Input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="จำนวนเงิน"
            required
            type="number"
            min="0"
            step="0.01"
          />
          <Input
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            placeholder="วันที่เริ่มต้น"
            type="date"
            required
          />
          <Input
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            placeholder="วันที่สิ้นสุด"
            type="date"
            required
          />
          <Select
            name="categoryId"
            value={form.categoryId || "ALL"}
            onValueChange={(value: string) =>
              setForm((f) => ({
                ...f,
                categoryId: value === "ALL" ? "" : value,
              }))
            }
            disabled={catLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกหมวดหมู่ (ไม่บังคับ)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">งบประมาณรวม</SelectItem>
              {Array.isArray(categories) &&
                categories
                  .filter((cat: any) => cat.type === "EXPENSE")
                  .map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransactionTable({ transactions, onEdit, onDelete }: any) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>วันที่</TableHead>
          <TableHead>ประเภท</TableHead>
          <TableHead>หมวดหมู่</TableHead>
          <TableHead>คำอธิบาย</TableHead>
          <TableHead>จำนวนเงิน</TableHead>
          <TableHead>บัญชี</TableHead>
          <TableHead>การดำเนินการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx: any) => (
          <TableRow key={tx.id}>
            <TableCell>
              {new Date(tx.date).toLocaleDateString("th-TH")}
            </TableCell>
            <TableCell>
              <Badge variant={tx.type === "INCOME" ? "success" : "destructive"}>
                {tx.type === "INCOME" ? "รายรับ" : "รายจ่าย"}
              </Badge>
            </TableCell>
            <TableCell>{tx.category.name}</TableCell>
            <TableCell>{tx.description || "-"}</TableCell>
            <TableCell
              className={
                tx.type === "INCOME" ? "text-green-600" : "text-red-600"
              }
            >
              {tx.type === "INCOME" ? "+" : "-"}฿
              {Number(tx.amount).toLocaleString()}
            </TableCell>
            <TableCell>{tx.account.name}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(tx)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(tx.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BudgetCard({ budget }: any) {
  const percentageUsed = budget.percentageUsed || 0;
  const isOverBudget = budget.isOverBudget;
  const isNearLimit = budget.isNearLimit;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{budget.category?.name || "งบประมาณรวม"}</span>
          {isOverBudget && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              เกินงบ
            </Badge>
          )}
          {isNearLimit && !isOverBudget && (
            <Badge variant="warning">
              <AlertTriangle className="h-3 w-3 mr-1" />
              ใกล้หมด
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>งบประมาณ:</span>
            <span className="font-semibold">
              ฿{Number(budget.amount).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>ใช้ไปแล้ว:</span>
            <span className="font-semibold">
              ฿{Number(budget.spent).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>เหลือ:</span>
            <span
              className={`font-semibold ${
                Number(budget.remaining) < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ฿{Number(budget.remaining).toLocaleString()}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>เปอร์เซ็นต์ที่ใช้:</span>
              <span className="font-semibold">
                {percentageUsed.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(percentageUsed, 100)}
              className={isOverBudget ? "bg-red-100" : ""}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(budget.startDate).toLocaleDateString("th-TH")} -{" "}
            {new Date(budget.endDate).toLocaleDateString("th-TH")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add types for transaction, pagination, and report

type Transaction = {
  id: string;
  date: string;
  type: string;
  category: { id: string; name: string };
  description?: string;
  amount: number;
  account: { id: string; name: string };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type MonthlyReport = {
  dailyBreakdown: Array<{
    date: string;
    income: number;
    expense: number;
    [key: string]: any;
  }>;
};

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    accountId: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const {
    transactions,
    pagination,
    refetch: refetchTransactions,
  } = useTransactions({
    ...filters,
    page: currentPage,
    limit: 10,
  }) as {
    transactions: Transaction[];
    pagination: Pagination | null;
    refetch: () => void;
  };
  const { accounts, refetch: refetchAccounts } = useAccounts();
  const { categories, refetch: refetchCategories } = useCategories();
  const { budgets, refetch: refetchBudgets } = useBudgets();
  const { alerts: budgetAlerts } = useBudgetAlerts();
  const { stats: rawTransactionStats } = useTransactionStats();
  const transactionStats: {
    income?: { total?: number };
    expense?: { total?: number };
  } = (rawTransactionStats && (rawTransactionStats as any)) || {};
  const { topCategories } = useTopSpendingCategories({
    limit: 5,
    period: "month",
  });
  const { report: rawMonthlyReport } = useMonthlyReport();
  const monthlyReport: MonthlyReport | undefined =
    rawMonthlyReport && typeof rawMonthlyReport === "object"
      ? (rawMonthlyReport as MonthlyReport)
      : undefined;

  // Calculate total balance
  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce(
        (sum: number, acc: any) => sum + (Number(acc.balance) || 0),
        0
      )
    : 0;

  // Prepare chart data
  const pieChartData = topCategories.map((cat: any, index: number) => ({
    name: cat.categoryName,
    value: Number(cat.totalAmount),
    color: COLORS[index % COLORS.length],
  }));

  // Defensive checks for transactionStats
  const incomeTotal =
    transactionStats && typeof transactionStats.income?.total === "number"
      ? transactionStats.income.total
      : 0;
  const expenseTotal =
    transactionStats && typeof transactionStats.expense?.total === "number"
      ? transactionStats.expense.total
      : 0;

  const barChartData =
    monthlyReport?.dailyBreakdown?.map(
      (day: { date: string; income: number; expense: number }) => ({
        date: new Date(day.date).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        รายรับ: day.income,
        รายจ่าย: day.expense,
      })
    ) || [];

  const lineChartData =
    monthlyReport?.dailyBreakdown?.map(
      (day: { date: string; income: number; expense: number }) => ({
        date: new Date(day.date).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        รายรับ: day.income,
        รายจ่าย: day.expense,
        ยอดสุทธิ: day.income - day.expense,
      })
    ) || [];

  const handleExport = async () => {
    try {
      const { getToken } = useAuth();
      const accessToken = await getToken();
      if (!accessToken) return;

      const blob = await exportTransactions(accessToken, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: "csv",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col py-8 px-4 gap-4 bg-background border-r shadow-sm">
        <div
          onClick={() => (window.location.href = "/")}
          className="mb-8 text-2xl font-bold tracking-tight text-foreground cursor-pointer"
        >
          ระบบจัดการรายรับ-รายจ่าย
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <HomeIcon /> หน้าหลัก
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <FileText /> รายงาน
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <Clock /> ประวัติ
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <User /> โปรไฟล์
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <Settings /> ตั้งค่า
          </Button>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="text-sm font-semibold text-muted-foreground mb-2">
            {clerkUser?.fullName ||
              clerkUser?.primaryEmailAddress?.emailAddress ||
              "-"}
          </div>
          <SignOutButton redirectUrl="/login">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut /> ออกจากระบบ
            </Button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background overflow-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-foreground">
              สวัสดี, {clerkUser?.firstName || clerkUser?.fullName || "ผู้ใช้"}
            </h1>
            <p className="text-muted-foreground">
              ดูยอดเงินคงเหลือและสรุปการเงินของคุณ 👀
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <AddTransactionModal onAdded={refetchTransactions} />
            <AddCategoryModal onAdded={refetchCategories} />
            <AddBudgetModal onAdded={refetchBudgets} />
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                ยอดเงินคงเหลือ
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{totalBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                รายรับเดือนนี้
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ฿{incomeTotal.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                รายจ่ายเดือนนี้
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ฿{expenseTotal.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดสุทธิ</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  incomeTotal - expenseTotal >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ฿{(incomeTotal - expenseTotal).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                สัดส่วนรายจ่ายตามหมวดหมู่
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
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
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Daily Income vs Expense */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                รายรับ-รายจ่ายรายวัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="รายรับ" fill="#10B981" />
                    <Bar dataKey="รายจ่าย" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts && budgetAlerts.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                แจ้งเตือนงบประมาณ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetAlerts.map((alert: any) => (
                  <div
                    key={alert.budget.id}
                    className="p-4 bg-white rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        {alert.budget.category?.name || "งบประมาณรวม"}
                      </span>
                      <Badge
                        variant={
                          alert.alertType === "OVER_BUDGET"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {alert.alertType === "OVER_BUDGET"
                          ? "เกินงบ"
                          : "ใกล้หมด"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      ใช้ไปแล้ว {alert.percentageUsed.toFixed(1)}% ของงบประมาณ
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budgets Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">งบประมาณ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget: any) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              ค้นหาและกรองรายการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="ค้นหาจากคำอธิบาย..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
              <Select
                value={filters.categoryId || "ALL"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    categoryId: value === "ALL" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุกหมวดหมู่</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.type || "ALL"}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value === "ALL" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุกประเภท</SelectItem>
                  <SelectItem value="INCOME">รายรับ</SelectItem>
                  <SelectItem value="EXPENSE">รายจ่าย</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                placeholder="วันที่เริ่มต้น"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                placeholder="วันที่สิ้นสุด"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: "",
                    categoryId: "",
                    accountId: "",
                    type: "",
                    startDate: "",
                    endDate: "",
                  });
                  setCurrentPage(1);
                }}
              >
                ล้างตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions as Transaction[]}
              onEdit={(tx: any) => console.log("Edit:", tx)}
              onDelete={async (id: string) => {
                try {
                  const { getToken } = useAuth();
                  const accessToken = await getToken();
                  if (!accessToken) return;
                  await deleteTransaction(id, accessToken);
                  refetchTransactions();
                } catch (error) {
                  console.error("Delete failed:", error);
                }
              }}
            />
            {pagination && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  แสดง{" "}
                  {((pagination as Pagination).page - 1) *
                    (pagination as Pagination).limit +
                    1}{" "}
                  ถึง{" "}
                  {Math.min(
                    (pagination as Pagination).page *
                      (pagination as Pagination).limit,
                    (pagination as Pagination).total
                  )}{" "}
                  จาก {(pagination as Pagination).total} รายการ
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(pagination as Pagination).page <= 1}
                    onClick={() =>
                      setCurrentPage((pagination as Pagination).page - 1)
                    }
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      (pagination as Pagination).page >=
                      (pagination as Pagination).pages
                    }
                    onClick={() =>
                      setCurrentPage((pagination as Pagination).page + 1)
                    }
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

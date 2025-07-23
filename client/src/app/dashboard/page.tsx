"use client";
import { useUser, useAuth, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
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
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  HomeIcon,
  FileText,
  Clock,
  User,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { useTransactions, useAccounts, useCategories } from "@/lib/hooks";
import { createCategory, createTransaction, createAccount } from "@/lib/api";

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
    date: "",
    categoryId: "",
    accountId: "",
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
              date: "",
              categoryId: "",
              accountId: "",
            });
            onAdded?.();
          }}
          className="space-y-4"
        >
          <Input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
            type="number"
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
          />
          <Select
            name="categoryId"
            value={form.categoryId}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, categoryId: value }))
            }
            disabled={catLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(categories) &&
                categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
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

function AddAccountModal({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", balance: "0", currency: "THB" });
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
          <Plus /> Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
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
              await createAccount(
                {
                  name: form.name,
                  balance: Number(form.balance),
                  currency: form.currency,
                },
                accessToken
              );
              setOpen(false);
              setForm({ name: "", balance: "0", currency: "THB" });
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
            placeholder="Account Name (เช่น บัญชีธนาคารA, เงินจากหุ้น)"
            required
          />
          <Input
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="Initial Balance"
            type="number"
            min="0"
          />
          <Select
            name="currency"
            value={form.currency}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, currency: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THB">THB</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const { transactions } = useTransactions();
  const { accounts, refetch: refetchAccounts } = useAccounts();
  const { categories, refetch: refetchCategories } = useCategories();

  console.log(transactions);

  // Example: calculate total balance
  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce(
        (sum: number, acc: any) => sum + (Number(acc.balance) || 0),
        0
      )
    : 0;

  // Example: chart data from transactions
  const chartDataMap: Record<string, { income: number; expense: number }> = {};
  const txList: any[] = Array.isArray(transactions) ? transactions : [];
  txList.forEach((tx) => {
    const month = new Date(tx.date).toLocaleString("default", {
      month: "short",
    });
    if (!chartDataMap[month]) chartDataMap[month] = { income: 0, expense: 0 };
    if (tx.amount > 0) chartDataMap[month].income += tx.amount;
    else chartDataMap[month].expense += Math.abs(tx.amount);
  });
  const chartData: { name: string; income: number; expense: number }[] =
    Object.entries(chartDataMap).map(([name, v]) => ({ name, ...v }));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col py-8 px-4 gap-4 bg-background border-r shadow-sm">
        <div
          onClick={() => (window.location.href = "/")}
          className="mb-8 text-2xl font-bold tracking-tight text-foreground cursor-pointer"
        >
          Binder
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <HomeIcon /> Dashboard
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <FileText /> Reports
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <Clock /> History
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <User /> Profile
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start text-foreground/70"
            disabled
          >
            <Settings /> Settings
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
              <LogOut /> Logout
            </Button>
          </SignOutButton>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-foreground">
              Hello, {clerkUser?.firstName || clerkUser?.fullName || "User"}
            </h1>
            <p className="text-muted-foreground">
              Take a look at your current balance 👀
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <AddTransactionModal />
            <AddCategoryModal onAdded={refetchCategories} />
            <AddAccountModal onAdded={refetchAccounts} />
            {/* AddCategoryModal, AddTagModal, AddBudgetModal สามารถเพิ่มได้ในอนาคต */}
          </div>
        </div>
        {/* Chart & Budgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 flex flex-col items-center justify-center py-6 bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">
                Total Balance
              </CardTitle>
              <div className="text-4xl font-bold text-primary mt-2">
                {totalBalance.toLocaleString()}฿
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-40 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      chartData as {
                        name: string;
                        income: number;
                        expense: number;
                      }[]
                    }
                  >
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="income" fill="#3b82f6" radius={4} />
                    <Bar dataKey="expense" fill="#facc15" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Budgets summary สามารถเพิ่มได้ในอนาคต */}
        </div>
        {/* Table */}
        <Card className="card bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Your Expenses</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left text-foreground">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-foreground">Date</th>
                  <th className="px-4 py-2 text-left text-foreground">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-foreground">
                    Account
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(transactions) &&
                  transactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2 text-foreground">
                        {tx.description || "-"}
                      </td>
                      <td className="px-4 py-2 text-foreground">{tx.amount}</td>
                      <td className="px-4 py-2 text-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {tx.category.name}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {tx.account.name}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";
import {
  useUser,
  useAuth,
  SignOutButton,
  SignedIn,
  UserButton,
  SignedOut,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import axios from "axios";
import { useProfile, useTransactions, useAccounts } from "@/lib/hooks";

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

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const token = await getToken();
    await axios.post("http://localhost:5000/transactions", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full flex items-center gap-2">
          <Plus /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
            className="input input-bordered w-full"
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="input input-bordered w-full"
          />
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            placeholder="Date"
            type="date"
            className="input input-bordered w-full"
          />
          <input
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            placeholder="Category ID"
            className="input input-bordered w-full"
          />
          <input
            name="accountId"
            value={form.accountId}
            onChange={handleChange}
            placeholder="Account ID"
            className="input input-bordered w-full"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useProfile();
  const { user: clerkUser } = useUser();
  const { transactions, loading: txLoading } = useTransactions();
  const { accounts, loading: accLoading } = useAccounts();

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
        <div className="mb-8 text-2xl font-bold tracking-tight text-foreground">
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
          <div className="flex gap-2">
            <AddTransactionModal />
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
                        {tx.description}
                      </td>
                      <td className="px-4 py-2 text-foreground">{tx.amount}</td>
                      <td className="px-4 py-2 text-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {tx.categoryId}
                      </td>
                      <td className="px-4 py-2 text-foreground">
                        {tx.accountId}
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

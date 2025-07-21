"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  HomeIcon,
  FileText,
  Clock,
  User,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TransactionForm } from "./create/transaction/page";
import { CategoryForm } from "./create/category/page";
import { TagForm } from "./create/tag/page";
import { AccountForm } from "./create/account/page";

const chartData = [
  { month: "Jan", expense: 1200, income: 2000 },
  { month: "Feb", expense: 2100, income: 2500 },
  { month: "Mar", expense: 800, income: 1800 },
];
const chartConfig = {
  expense: { label: "Expense", color: "var(--chart-1)" },
  income: { label: "Income", color: "var(--chart-2)" },
};

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/profile", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
          fetch("http://localhost:5000/transactions", {
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) => setTransactions(data));
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Card className="w-full max-w-sm p-8">
          <CardTitle className="mb-4 text-center">Expense Tracker</CardTitle>
          <a href="http://localhost:5000/login">
            <Button className="w-full">Login with Auth0</Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <aside className="sidebar w-64 flex flex-col py-8 px-4 gap-4">
        <div className="mb-8 text-2xl font-bold tracking-tight">Binder</div>
        <nav className="flex flex-col gap-2 flex-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted font-medium text-primary"
          >
            <HomeIcon /> Dashboard
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"
          >
            <FileText /> Reports
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"
          >
            <Clock /> History
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"
          >
            <User /> Profile
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"
          >
            <Settings /> Settings
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="text-sm font-semibold text-muted-foreground mb-2">
            Marcos Kahn
          </div>
          <a href="http://localhost:5000/logout">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut /> Logout
            </Button>
          </a>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 bg-muted/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Hello, Marcos</h1>
            <p className="text-muted-foreground">
              Take a look at your current balance 👀
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-2">
                  <Plus /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Add a new transaction to your account.
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Add Category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                  <DialogDescription>
                    Add a new category to your account.
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Add Tag</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tag</DialogTitle>
                  <DialogDescription>
                    Add a new tag to your account.
                  </DialogDescription>
                </DialogHeader>
                <TagForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Add Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Account</DialogTitle>
                  <DialogDescription>
                    Add a new account to your account.
                  </DialogDescription>
                </DialogHeader>
                <AccountForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Cards & Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card col-span-1 flex flex-col items-center justify-center py-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Total Balance</CardTitle>
              <CardDescription>550,20€</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">550,20€</div>
              <div className="flex justify-between w-full mt-2 text-sm">
                <span className="text-blue-600">Requested</span>
                <span className="text-yellow-500">Unrequested</span>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-blue-600">467,86€</span>
                <span className="text-yellow-500">82,34€</span>
              </div>
            </CardContent>
          </Card>
          <Card className="card col-span-2">
            <CardHeader>
              <CardTitle>Your Expenses (Mock Chart)</CardTitle>
              <CardDescription>Last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
              >
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="expense" fill="var(--chart-1)" radius={4} />
                  <Bar dataKey="income" fill="var(--chart-2)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        {/* Table */}
        <Card className="card">
          <CardHeader>
            <CardTitle>Your Expenses</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Budget</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2">{tx.company || "-"}</td>
                      <td className="px-4 py-2">{tx.budget || "-"}</td>
                      <td className="px-4 py-2">{tx.date || "-"}</td>
                      <td className="px-4 py-2">{tx.amount || "-"}</td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            tx.status === "Approved"
                              ? "text-green-600"
                              : tx.status === "Pending"
                              ? "text-yellow-600"
                              : "text-muted-foreground"
                          }
                        >
                          {tx.status || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

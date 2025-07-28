"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useGlobalStore, GlobalStoreState } from "@/lib/store";
import { deleteTransaction, exportTransactions } from "@/lib/api";
import React from "react";
import { AddTransactionModal } from "@/components/dashboard/AddTransactionModal";
import { EditTransactionModal } from "@/components/dashboard/EditTransactionModal";
import { ConfirmDeleteModal } from "@/components/dashboard/ConfirmDeleteModal";
import type { Transaction, Pagination } from "@/components/dashboard/types";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useDashboardFilters } from "./hooks";
import { formatDate } from "@/lib/utils";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toast";
import { ProtectedRoute, ErrorBoundary } from "@/components/auth";
import toast from "react-hot-toast";

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

export default function EnhancedDashboard() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [filters, setFilters] = useDashboardFilters();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // ป้องกัน fetch ซ้ำ
  const lastFetchParamsRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);

  const transactionsParams = useMemo(
    () => ({
      ...filters,
      page: 1,
      limit: 5, // แสดงแค่ 5 รายการล่าสุด
    }),
    [filters]
  );

  const transactionStatsParams = useMemo(() => ({}), []);
  const topCategoriesParams = useMemo(
    () => ({ limit: 5, period: "month" }),
    []
  );
  const monthlyReportParams = useMemo(() => ({}), []);

  const {
    categories,
    categoriesLoading: catLoading,
    fetchCategories,
    accounts,
    accountsLoading: accLoading,
    fetchAccounts,
    transactions,
    transactionsPagination: pagination,
    transactionsLoading,
    fetchTransactions,
    stats,
    statsLoading,
    fetchStats,
    topCategories,
    topCategoriesLoading,
    fetchTopCategories,
    monthlyReport,
    monthlyReportLoading,
    fetchMonthlyReport,
  } = useGlobalStore() as GlobalStoreState;

  // แยก initial data load ออกจาก transaction params
  useEffect(() => {
    let mounted = true;

    (async () => {
      const accessToken = await getToken();
      if (!accessToken || !mounted) return;

      if (isInitialLoadRef.current) {
        // Load initial data ครั้งเดียว
        await Promise.all([
          fetchCategories(accessToken),
          fetchAccounts(accessToken),
          fetchStats(accessToken, transactionStatsParams),
          fetchTopCategories(accessToken, topCategoriesParams),
          fetchMonthlyReport(accessToken, monthlyReportParams),
        ]);
        isInitialLoadRef.current = false;
      }
    })();

    return () => {
      mounted = false;
    };
  }, [getToken]); // ไม่ต้องใส่ dependencies อื่น

  // แยก transaction fetch ออกมา และใช้ debounce
  useEffect(() => {
    const paramsString = JSON.stringify(transactionsParams);

    // ถ้า params เหมือนเดิม ไม่ต้อง fetch
    if (lastFetchParamsRef.current === paramsString) {
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      const accessToken = await getToken();
      if (!accessToken) return;

      await fetchTransactions(accessToken, transactionsParams);
      lastFetchParamsRef.current = paramsString;
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [transactionsParams, getToken, fetchTransactions]);

  // Callbacks ที่ไม่ trigger re-fetch categories
  const handleTransactionAdded = useCallback(async () => {
    console.log("[AddTransactionModal] onAdded called");

    const accessToken = await getToken();
    if (!accessToken) return;

    // สร้าง params สำหรับ page 1 เพื่อแสดงรายการล่าสุด
    const freshParams = {
      ...filters,
      page: 1,
      limit: 5,
    };

    // Fetch transactions ใหม่ทันที
    await fetchTransactions(accessToken, freshParams);

    // อัปเดท stats ด้วยเพื่อให้ summary cards อัปเดท
    await fetchStats(accessToken, transactionStatsParams);

    // อัปเดท accounts balance (ในกรณีที่ balance เปลี่ยน)
    await fetchAccounts(accessToken);
  }, [
    filters,
    getToken,
    fetchTransactions,
    fetchStats,
    fetchAccounts,
    transactionStatsParams,
  ]);

  // Calculate total balance
  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce(
        (sum: number, acc: any) => sum + (Number(acc.balance) || 0),
        0
      )
    : 0;

  const handleDelete = async (id: string) => {
    setDeleteTxId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTxId) return;
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      await deleteTransaction(deleteTxId, accessToken);
      setDeleteTxId(null);

      // Refetch data ทันที
      await Promise.all([
        fetchTransactions(accessToken, transactionsParams),
        fetchStats(accessToken, transactionStatsParams),
        fetchAccounts(accessToken), // อัปเดท account balance
      ]);

      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Error deleting transaction");
      setDeleteTxId(null);
    }
  };

  const cancelDelete = () => setDeleteTxId(null);

  const incomeTotal = stats?.income?.total || 0;
  const expenseTotal = stats?.expense?.total || 0;

  const pieChartData =
    topCategories?.map((cat: any, index: number) => ({
      name: cat.categoryName,
      value: Number(cat.totalAmount),
      color: COLORS[index % COLORS.length],
    })) || [];

  const barChartData =
    monthlyReport?.dailyBreakdown?.map(
      (day: { date: string; income: number; expense: number }) => ({
        date: formatDate(day.date, "en-US", { day: "numeric", month: "short" }),
        income: day.income,
        expense: day.expense,
      })
    ) || [];

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen flex bg-background mt-2">
          <Toaster />
          <DashboardSidebar clerkUser={clerkUser} />
          <main className="flex-1 p-8 bg-background overflow-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1 text-foreground">
                  Hello,{" "}
                  {clerkUser?.firstName?.toUpperCase() ||
                    clerkUser?.fullName ||
                    "User"}
                </h1>
                <p className="text-muted-foreground">
                  See your balance and financial summary 👀
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <AddTransactionModal
                  onAdded={handleTransactionAdded}
                  categories={categories}
                  catLoading={catLoading}
                  refetchCategories={() => {}} // ไม่ต้อง refetch
                />
              </div>
            </div>

            {/* ยอดเงินคงเหลือและรายรับ-รายจ่ายเดือนนี้ */}
            <SummaryCards
              totalBalance={totalBalance}
              incomeTotal={incomeTotal}
              expenseTotal={expenseTotal}
            />

            {/* Charts แสดงสถิติ */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Financial Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardCharts
                  pieChartData={pieChartData}
                  barChartData={barChartData}
                />
              </CardContent>
            </Card>

            {/* รายการล่าสุด 5 อันดับ */}
            <Card>
              <CardHeader>
                <CardTitle>Latest 5 Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <TransactionTable
                    transactions={transactions as Transaction[]}
                    onEdit={setEditingTransaction}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No latest transactions
                  </div>
                )}
              </CardContent>
            </Card>

            {editingTransaction && (
              <EditTransactionModal
                open={!!editingTransaction}
                onOpenChange={setEditingTransaction}
                transaction={editingTransaction}
                onSaved={async () => {
                  const accessToken = await getToken();
                  if (!accessToken) return;

                  // Refetch data ทันที
                  await Promise.all([
                    fetchTransactions(accessToken, transactionsParams),
                    fetchStats(accessToken, transactionStatsParams),
                    fetchAccounts(accessToken),
                  ]);

                  toast.success("Transaction updated successfully");
                }}
              />
            )}

            <ConfirmDeleteModal
              open={!!deleteTxId}
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
            />
          </main>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

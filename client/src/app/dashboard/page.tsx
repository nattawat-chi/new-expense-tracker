"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Search } from "lucide-react";
import { useGlobalStore, GlobalStoreState } from "@/lib/store";
import { deleteTransaction, exportTransactions } from "@/lib/api";
import { AddCategoryModal } from "@/components/dashboard/AddCategoryModal";
import { AddTransactionModal } from "@/components/dashboard/AddTransactionModal";
import { AddBudgetModal } from "@/components/dashboard/AddBudgetModal";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";
import { EditTransactionModal } from "@/components/dashboard/EditTransactionModal";
import { ConfirmDeleteModal } from "@/components/dashboard/ConfirmDeleteModal";
import type {
  Transaction,
  Pagination,
  MonthlyReport,
} from "@/components/dashboard/types";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { BudgetAlertsSection } from "@/components/dashboard/BudgetAlertsSection";
import { useDashboardFilters } from "./hooks";
import { formatDate } from "@/lib/utils";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { BudgetSection } from "@/components/dashboard/BudgetSection";
import { TransactionSection } from "@/components/dashboard/TransactionSection";
import { ExportButton } from "@/components/dashboard/ExportButton";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // ป้องกัน fetch ซ้ำ
  const lastFetchParamsRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);

  const transactionsParams = useMemo(
    () => ({
      ...filters,
      page: currentPage,
      limit: 10,
    }),
    [filters, currentPage]
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
    budgets,
    budgetsLoading: budgetsLoading,
    fetchBudgets,
    transactions,
    transactionsPagination: pagination,
    transactionsLoading,
    fetchTransactions,
    stats,
    statsLoading,
    fetchStats,
    alerts,
    alertsLoading,
    fetchAlerts,
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
          fetchBudgets(accessToken),
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
      limit: 10,
    };

    // Fetch transactions ใหม่ทันที
    await fetchTransactions(accessToken, freshParams);

    // อัปเดท stats ด้วยเพื่อให้ summary cards อัปเดท
    await fetchStats(accessToken, transactionStatsParams);

    // อัปเดท accounts balance (ในกรณีที่ balance เปลี่ยน)
    await fetchAccounts(accessToken);

    // ตั้ง currentPage เป็น 1 เพื่อให้ UI sync
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    filters,
    currentPage,
    getToken,
    fetchTransactions,
    fetchStats,
    fetchAccounts,
    transactionStatsParams,
  ]);

  const handleCategoryAdded = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;
    // เฉพาะ categories ที่ต้อง refetch
    await fetchCategories(accessToken);
  }, [getToken, fetchCategories]);

  const handleBudgetAdded = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;
    await fetchBudgets(accessToken);
  }, [getToken, fetchBudgets]);

  const handleAccountAdded = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;
    await fetchAccounts(accessToken);
  }, [getToken, fetchAccounts]);

  // Calculate total balance
  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce(
        (sum: number, acc: any) => sum + (Number(acc.balance) || 0),
        0
      )
    : 0;

  const handleExport = async () => {
    try {
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
    } catch (error) {
      console.error("Delete failed:", error);
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
        date: formatDate(day.date, "th-TH", { day: "numeric", month: "short" }),
        รายรับ: day.income,
        รายจ่าย: day.expense,
      })
    ) || [];

  const budgetAlerts = alerts;

  return (
    <div className="min-h-screen flex bg-background mt-2">
      <DashboardSidebar clerkUser={clerkUser} />
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
            <AddTransactionModal
              onAdded={handleTransactionAdded}
              categories={categories}
              catLoading={catLoading}
              refetchCategories={() => {}} // ไม่ต้อง refetch
            />
            <AddCategoryModal
              onAdded={handleCategoryAdded}
              categories={categories}
              catLoading={catLoading}
              refetchCategories={() => {}} // ไม่ต้อง refetch
            />
            <AddBudgetModal onAdded={handleBudgetAdded} />
            <AddAccountModal onAdded={handleAccountAdded} />
            <ExportButton onExport={handleExport} />
          </div>
        </div>

        <BudgetSection
          budgets={budgets}
          totalBalance={totalBalance}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
          pieChartData={pieChartData}
          barChartData={barChartData}
        />
        {/* <SummaryCards
          totalBalance={totalBalance}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
        />
        <DashboardCharts
          pieChartData={pieChartData}
          barChartData={barChartData}
        /> */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              ค้นหาและกรองรายการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardFilterBar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
            />
          </CardContent>
        </Card>

        <BudgetAlertsSection budgetAlerts={budgetAlerts} />

        <Card>
          <CardHeader>
            <CardTitle>รายการล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {pagination ? (
              <TransactionSection
                transactions={transactions as Transaction[]}
                pagination={pagination}
                onEdit={setEditingTransaction}
                onDelete={handleDelete}
                setCurrentPage={setCurrentPage}
              />
            ) : null}
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
                fetchAccounts(accessToken), // อัปเดท account balance
              ]);
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
  );
}

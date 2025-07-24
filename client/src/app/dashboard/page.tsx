"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useMemo, useEffect, useRef } from "react";
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

export default function EnhancedDashboard() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  // Replace useState for filters with useDashboardFilters
  const [filters, setFilters] = useDashboardFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  // Add state for delete confirmation
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  // ป้องกัน fetch ซ้ำ
  const isFetchingRef = useRef(false);

  // ใช้ useMemo ครอบ params ที่ pass เข้า custom hooks
  const transactionsParams = useMemo(
    () => ({
      ...filters,
      page: currentPage,
      limit: 10,
    }),
    [filters, currentPage]
  );

  // memoize params
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

  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    debounceTimeout = setTimeout(() => {
      console.log("[useEffect] fetchTransactions triggered (debounced)", {
        transactionsParams,
        currentPage,
        filters,
      });
      (async () => {
        const accessToken = await getToken();
        if (!accessToken) {
          isFetchingRef.current = false;
          return;
        }
        try {
          await Promise.all([
            fetchCategories(accessToken),
            fetchAccounts(accessToken),
            fetchBudgets(accessToken),
            fetchTransactions(accessToken, transactionsParams),
          ]);
        } finally {
          isFetchingRef.current = false;
        }
      })();
    }, 400); // debounce 400ms
    return () => {
      clearTimeout(debounceTimeout);
      isFetchingRef.current = false;
    };
  }, [transactionsParams]);

  // useEffect สำหรับ fetchStats
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    debounceTimeout = setTimeout(() => {
      (async () => {
        const accessToken = await getToken();
        if (!accessToken) return;
        fetchStats(accessToken, transactionStatsParams);
      })();
    }, 400);
    return () => clearTimeout(debounceTimeout);
  }, [transactionStatsParams]);

  // useEffect สำหรับ fetchTopCategories
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    debounceTimeout = setTimeout(() => {
      (async () => {
        const accessToken = await getToken();
        if (!accessToken) return;
        fetchTopCategories(accessToken, topCategoriesParams);
      })();
    }, 400);
    return () => clearTimeout(debounceTimeout);
  }, [topCategoriesParams]);

  // useEffect สำหรับ fetchMonthlyReport
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    debounceTimeout = setTimeout(() => {
      (async () => {
        const accessToken = await getToken();
        if (!accessToken) return;
        fetchMonthlyReport(accessToken, monthlyReportParams);
      })();
    }, 400);
    return () => clearTimeout(debounceTimeout);
  }, [monthlyReportParams]);

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
      fetchTransactions(accessToken, transactionsParams);
    } catch (error) {
      setDeleteTxId(null);
      // handle error if needed
    }
  };
  const cancelDelete = () => setDeleteTxId(null);

  // SummaryCards
  const incomeTotal = stats?.income?.total || 0;
  const expenseTotal = stats?.expense?.total || 0;

  // Chart data
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

  // Budget Alerts
  const budgetAlerts = alerts;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <DashboardSidebar clerkUser={clerkUser} />
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
            <AddTransactionModal
              onAdded={() => {
                console.log("[AddTransactionModal] onAdded called", {
                  currentPage,
                });
                if (currentPage !== 1) setCurrentPage(1);
              }}
              categories={categories}
              catLoading={catLoading}
              refetchCategories={async () => {
                const accessToken = await getToken();
                if (!accessToken) return;
                fetchCategories(accessToken);
              }}
            />
            <AddCategoryModal
              onAdded={async () => {
                const accessToken = await getToken();
                if (!accessToken) return;
                fetchCategories(accessToken);
              }}
              categories={categories}
              catLoading={catLoading}
              refetchCategories={async () => {
                const accessToken = await getToken();
                if (!accessToken) return;
                fetchCategories(accessToken);
              }}
            />
            <AddBudgetModal
              onAdded={async () => {
                const accessToken = await getToken();
                if (!accessToken) return;
                fetchBudgets(accessToken);
              }}
            />
            <AddAccountModal
              onAdded={async () => {
                const accessToken = await getToken();
                if (!accessToken) return;
                fetchAccounts(accessToken);
              }}
            />
            <ExportButton onExport={handleExport} />
          </div>
        </div>

        {/* Budgets Section */}
        <BudgetSection budgets={budgets} />

        {/* Search and Filter */}
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

        {/* Summary Cards */}
        <SummaryCards
          totalBalance={totalBalance}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
        />

        {/* Charts Section */}
        <DashboardCharts
          pieChartData={pieChartData}
          barChartData={barChartData}
        />

        {/* Budget Alerts */}
        <BudgetAlertsSection budgetAlerts={budgetAlerts} />

        {/* Transactions Table + Pagination */}
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

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <EditTransactionModal
            open={!!editingTransaction}
            onOpenChange={setEditingTransaction}
            transaction={editingTransaction}
            onSaved={async () => {
              const accessToken = await getToken();
              if (!accessToken) return;
              fetchTransactions(accessToken, transactionsParams);
            }}
          />
        )}

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          open={!!deleteTxId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </main>
    </div>
  );
}

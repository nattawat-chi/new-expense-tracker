import { create } from "zustand";
import { getCategories, getAccounts, getBudgets, getTransactions } from "./api";
import { devtools } from "zustand/middleware";

export interface GlobalStoreState {
  categories: any[];
  categoriesLoading: boolean;
  categoriesError: any;
  fetchCategories: (accessToken: string) => Promise<void>;

  accounts: any[];
  accountsLoading: boolean;
  accountsError: any;
  fetchAccounts: (accessToken: string) => Promise<void>;

  budgets: any[];
  budgetsLoading: boolean;
  budgetsError: any;
  fetchBudgets: (accessToken: string) => Promise<void>;

  transactions: any[];
  transactionsPagination: any;
  transactionsLoading: boolean;
  transactionsError: any;
  fetchTransactions: (accessToken: string, params?: any) => Promise<void>;

  // เพิ่ม stats
  stats: any;
  statsLoading: boolean;
  statsError: any;
  fetchStats: (accessToken: string, params?: any) => Promise<void>;

  // เพิ่ม alerts
  alerts: any[];
  alertsLoading: boolean;
  alertsError: any;
  fetchAlerts: (accessToken: string) => Promise<void>;

  // เพิ่ม topCategories
  topCategories: any[];
  topCategoriesLoading: boolean;
  topCategoriesError: any;
  fetchTopCategories: (accessToken: string, params?: any) => Promise<void>;

  // เพิ่ม monthlyReport
  monthlyReport: any;
  monthlyReportLoading: boolean;
  monthlyReportError: any;
  fetchMonthlyReport: (accessToken: string, params?: any) => Promise<void>;

  // เพิ่ม yearlyReport
  yearlyReport: any;
  yearlyReportLoading: boolean;
  yearlyReportError: any;
  fetchYearlyReport: (accessToken: string, params?: any) => Promise<void>;

  // เพิ่ม trendsReport
  trendsReport: any;
  trendsReportLoading: boolean;
  trendsReportError: any;
  fetchTrendsReport: (accessToken: string, params?: any) => Promise<void>;
}

export const useGlobalStore = create<GlobalStoreState>()(
  devtools((set, get) => ({
    categories: [],
    categoriesLoading: false,
    categoriesError: null,
    fetchCategories: async (accessToken) => {
      set({ categoriesLoading: true });
      try {
        const data = await getCategories(accessToken);
        set({ categories: data, categoriesError: null });
      } catch (err) {
        set({ categoriesError: err });
      } finally {
        set({ categoriesLoading: false });
      }
    },

    accounts: [],
    accountsLoading: false,
    accountsError: null,
    fetchAccounts: async (accessToken) => {
      set({ accountsLoading: true });
      try {
        const data = await getAccounts(accessToken);
        set({ accounts: data, accountsError: null });
      } catch (err) {
        set({ accountsError: err });
      } finally {
        set({ accountsLoading: false });
      }
    },

    budgets: [],
    budgetsLoading: false,
    budgetsError: null,
    fetchBudgets: async (accessToken) => {
      set({ budgetsLoading: true });
      try {
        const data = await getBudgets(accessToken);
        set({ budgets: data, budgetsError: null });
      } catch (err) {
        set({ budgetsError: err });
      } finally {
        set({ budgetsLoading: false });
      }
    },

    transactions: [],
    transactionsPagination: null,
    transactionsLoading: false,
    transactionsError: null,
    fetchTransactions: async (accessToken, params) => {
      set({ transactionsLoading: true });
      try {
        const data = await getTransactions(accessToken, params);
        set({
          transactions: data.transactions || data,
          transactionsPagination: data.pagination || null,
          transactionsError: null,
        });
      } catch (err) {
        set({ transactionsError: err });
      } finally {
        set({ transactionsLoading: false });
      }
    },

    // เพิ่ม stats
    stats: null,
    statsLoading: false,
    statsError: null,
    fetchStats: async (accessToken, params) => {
      set({ statsLoading: true });
      try {
        const { getTransactionStats } = await import("./api");
        const data = await getTransactionStats(accessToken, params);
        set({ stats: data, statsError: null });
      } catch (err) {
        set({ statsError: err });
      } finally {
        set({ statsLoading: false });
      }
    },

    // เพิ่ม alerts
    alerts: [],
    alertsLoading: false,
    alertsError: null,
    fetchAlerts: async (accessToken) => {
      set({ alertsLoading: true });
      try {
        const { getBudgetAlerts } = await import("./api");
        const data = await getBudgetAlerts(accessToken);
        set({ alerts: data, alertsError: null });
      } catch (err) {
        set({ alertsError: err });
      } finally {
        set({ alertsLoading: false });
      }
    },

    // เพิ่ม topCategories
    topCategories: [],
    topCategoriesLoading: false,
    topCategoriesError: null,
    fetchTopCategories: async (accessToken, params) => {
      set({ topCategoriesLoading: true });
      try {
        const { getTopSpendingCategories } = await import("./api");
        const data = await getTopSpendingCategories(accessToken, params);
        set({ topCategories: data, topCategoriesError: null });
      } catch (err) {
        set({ topCategoriesError: err });
      } finally {
        set({ topCategoriesLoading: false });
      }
    },

    // เพิ่ม monthlyReport
    monthlyReport: null,
    monthlyReportLoading: false,
    monthlyReportError: null,
    fetchMonthlyReport: async (accessToken, params) => {
      set({ monthlyReportLoading: true });
      try {
        const { getMonthlyReport } = await import("./api");
        const data = await getMonthlyReport(accessToken, params);
        set({ monthlyReport: data, monthlyReportError: null });
      } catch (err) {
        set({ monthlyReportError: err });
      } finally {
        set({ monthlyReportLoading: false });
      }
    },

    // เพิ่ม yearlyReport
    yearlyReport: null,
    yearlyReportLoading: false,
    yearlyReportError: null,
    fetchYearlyReport: async (accessToken, params) => {
      set({ yearlyReportLoading: true });
      try {
        const { getYearlyReport } = await import("./api");
        const data = await getYearlyReport(accessToken, params);
        set({ yearlyReport: data, yearlyReportError: null });
      } catch (err) {
        set({ yearlyReportError: err });
      } finally {
        set({ yearlyReportLoading: false });
      }
    },

    // เพิ่ม trendsReport
    trendsReport: null,
    trendsReportLoading: false,
    trendsReportError: null,
    fetchTrendsReport: async (accessToken, params) => {
      set({ trendsReportLoading: true });
      try {
        const { getTrendsReport } = await import("./api");
        const data = await getTrendsReport(accessToken, params);
        set({ trendsReport: data, trendsReportError: null });
      } catch (err) {
        set({ trendsReportError: err });
      } finally {
        set({ trendsReportLoading: false });
      }
    },
  }))
);

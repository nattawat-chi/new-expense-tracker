import { useEffect, useState, useCallback } from "react";
import {
  getProfile,
  getTransactions,
  getTransactionStats,
  getAccounts,
  getBudgets,
  getBudgetAlerts,
  getCategories,
  getCategoryStats,
  getTopSpendingCategories,
  getTags,
  getMonthlyReport,
  getYearlyReport,
  getTrendsReport,
} from "./api";
import { useAuth } from "@clerk/nextjs";

export function useProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getToken();
        if (!accessToken) throw new Error("No access token");
        const data = await getProfile(accessToken);
        setUser(data);
      } catch (err) {
        setError(err);
        if (
          typeof err === "object" &&
          err &&
          "response" in err &&
          (err as any)?.response?.status &&
          ((err as any).response.status === 401 ||
            (err as any).response.status === 302)
        ) {
          const accessToken = await getToken();
          if (accessToken) {
            window.location.href = `http://localhost:5000/login?access_token=${accessToken}`;
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { user, loading, error };
}

export function useTransactions(params?: any) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getTransactions(accessToken, params);
      setTransactions(data.transactions || data);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    pagination,
    loading,
    error,
    refetch: fetchTransactions,
  };
}

export function useTransactionStats(params?: any) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getTransactionStats(accessToken, params);
      setStats(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getAccounts(accessToken);
      setAccounts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { accounts, loading, error, refetch: fetchAccounts };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getBudgets(accessToken);
      setBudgets(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return { budgets, loading, error, refetch: fetchBudgets };
}

export function useBudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getBudgetAlerts(accessToken);
      setAlerts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, error, refetch: fetchAlerts };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getCategories(accessToken);
      setCategories(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
}

export function useCategoryStats(params?: any) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getCategoryStats(accessToken, params);
      setStats(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useTopSpendingCategories(params?: any) {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchTopCategories = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getTopSpendingCategories(accessToken, params);
      setTopCategories(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchTopCategories();
  }, [fetchTopCategories]);

  return { topCategories, loading, error, refetch: fetchTopCategories };
}

export function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getTags(accessToken);
      setTags(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, error, refetch: fetchTags };
}

export function useMonthlyReport(params?: any) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getMonthlyReport(accessToken, params);
      setReport(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}

export function useYearlyReport(params?: any) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getYearlyReport(accessToken, params);
      setReport(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}

export function useTrendsReport(params?: any) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getToken();
      if (!accessToken) throw new Error("No access token");
      const data = await getTrendsReport(accessToken, params);
      setReport(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getToken, params]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}

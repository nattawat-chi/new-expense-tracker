import { useEffect, useState } from "react";
import {
  getProfile,
  getTransactions,
  getAccounts,
  getBudgets,
  getCategories,
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

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getToken();
        if (!accessToken) throw new Error("No access token");
        const data = await getTransactions(accessToken);
        console.log(data);
        setTransactions(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { transactions, loading, error };
}

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchAccounts = async () => {
    try {
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
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getToken();
        if (!accessToken) throw new Error("No access token");
        const data = await getBudgets(accessToken);
        setBudgets(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { budgets, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { getToken } = useAuth();

  const fetchCategories = async () => {
    try {
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

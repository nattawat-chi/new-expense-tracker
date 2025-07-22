import { useEffect, useState } from "react";
import { getProfile, getTransactions, getAccounts, getBudgets } from "./api";
import { useAuth } from "@clerk/nextjs";

export function useProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();
  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(async (err) => {
        setError(err);
        // ถ้า error เป็น 401 หรือ 302 ให้ redirect ไป login
        if (err?.response?.status === 401 || err?.response?.status === 302) {
          const accessToken = await getToken();
          window.location.href = `http://localhost:5000/login?access_token=${accessToken}`;
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { transactions, loading, error };
}

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { accounts, loading, error };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBudgets()
      .then(setBudgets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { budgets, loading, error };
}

import axios from "axios";
import { useAuth } from "@clerk/nextjs";

const API_BASE = "http://localhost:5000";

export const getProfile = async () => {
  const { getToken } = useAuth();
  const accessToken = await getToken();
  console.log(accessToken);
  const res = await axios.get(`${API_BASE}/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getTransactions = async () => {
  const { getToken } = useAuth();
  const accessToken = await getToken();
  const res = await axios.get(`${API_BASE}/transactions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getAccounts = async () => {
  const { getToken } = useAuth();
  const accessToken = await getToken();
  const res = await axios.get(`${API_BASE}/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getBudgets = async () => {
  const { getToken } = useAuth();
  const accessToken = await getToken();
  const res = await axios.get(`${API_BASE}/budgets`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

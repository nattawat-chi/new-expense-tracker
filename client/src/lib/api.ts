import axios from "axios";

const API_BASE = "http://localhost:5000";

export const getProfile = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getTransactions = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/transactions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log(res.data);
  return res.data;
};

export const createTransaction = async (
  data: {
    amount: number;
    date: string;
    description: string;
    categoryId: string;
  },
  accessToken: string
) => {
  const res = await axios.post(`${API_BASE}/transactions`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getAccounts = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const createAccount = async (
  data: { name: string; balance: number; currency: string },
  accessToken: string
) => {
  const res = await axios.post(`${API_BASE}/accounts`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getBudgets = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/budgets`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getCategories = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/categories`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const createCategory = async (
  data: { name: string; type: string },
  accessToken: string
) => {
  const res = await axios.post(`${API_BASE}/categories`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

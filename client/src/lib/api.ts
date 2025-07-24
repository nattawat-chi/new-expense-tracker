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

// Transaction APIs
export const getTransactions = async (
  accessToken: string,
  params?: {
    search?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
  }
) => {
  const res = await axios.get(`${API_BASE}/transactions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

export const getTransactionStats = async (
  accessToken: string,
  params?: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const res = await axios.get(`${API_BASE}/transactions/stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

export const createTransaction = async (
  data: {
    amount: number;
    date: string;
    description: string;
    categoryId: string;
    accountId: string;
    type?: string;
    tagIds?: string[];
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

export const updateTransaction = async (
  id: string,
  data: {
    amount?: number;
    date?: string;
    description?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    tagIds?: string[];
  },
  accessToken: string
) => {
  const res = await axios.put(`${API_BASE}/transactions/${id}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const deleteTransaction = async (id: string, accessToken: string) => {
  const res = await axios.delete(`${API_BASE}/transactions/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

// Account APIs
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

// Budget APIs
export const getBudgets = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/budgets`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const createBudget = async (
  data: {
    amount: number;
    startDate: string;
    endDate: string;
    categoryId?: string;
  },
  accessToken: string
) => {
  const res = await axios.post(`${API_BASE}/budgets`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const updateBudget = async (
  id: string,
  data: {
    amount?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  },
  accessToken: string
) => {
  const res = await axios.put(`${API_BASE}/budgets/${id}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const deleteBudget = async (id: string, accessToken: string) => {
  const res = await axios.delete(`${API_BASE}/budgets/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getBudgetAlerts = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/budgets/alerts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getBudgetComparison = async (id: string, accessToken: string) => {
  const res = await axios.get(`${API_BASE}/budgets/${id}/comparison`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

// Category APIs
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

export const updateCategory = async (
  id: string,
  data: { name: string; type: string },
  accessToken: string
) => {
  const res = await axios.put(`${API_BASE}/categories/${id}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const deleteCategory = async (id: string, accessToken: string) => {
  const res = await axios.delete(`${API_BASE}/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const getCategoryStats = async (
  accessToken: string,
  params?: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const res = await axios.get(`${API_BASE}/categories/stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

export const getTopSpendingCategories = async (
  accessToken: string,
  params?: {
    limit?: number;
    period?: string;
  }
) => {
  const res = await axios.get(`${API_BASE}/categories/top-spending`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

// Report APIs
export const getMonthlyReport = async (
  accessToken: string,
  params?: {
    year?: number;
    month?: number;
  }
) => {
  const res = await axios.get(`${API_BASE}/reports/monthly`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

export const getYearlyReport = async (
  accessToken: string,
  params?: {
    year?: number;
  }
) => {
  const res = await axios.get(`${API_BASE}/reports/yearly`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

export const getTrendsReport = async (
  accessToken: string,
  params?: {
    period?: string;
  }
) => {
  const res = await axios.get(`${API_BASE}/reports/trends`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
  });
  return res.data;
};

export const exportTransactions = async (
  accessToken: string,
  params?: {
    startDate?: string;
    endDate?: string;
    format?: string;
  }
) => {
  const res = await axios.get(`${API_BASE}/reports/export`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params,
    responseType: params?.format === "csv" ? "blob" : "json",
  });
  return res.data;
};

// Tag APIs
export const getTags = async (accessToken: string) => {
  const res = await axios.get(`${API_BASE}/tags`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const createTag = async (
  data: { name: string },
  accessToken: string
) => {
  const res = await axios.post(`${API_BASE}/tags`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const updateTag = async (
  id: string,
  data: { name: string },
  accessToken: string
) => {
  const res = await axios.put(`${API_BASE}/tags/${id}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const deleteTag = async (id: string, accessToken: string) => {
  const res = await axios.delete(`${API_BASE}/tags/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export type Transaction = {
  id: string;
  date: string;
  type: string;
  category: { id: string; name: string };
  description?: string;
  amount: number;
  account: { id: string; name: string };
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type MonthlyReport = {
  dailyBreakdown: Array<{
    date: string;
    income: number;
    expense: number;
    [key: string]: any;
  }>;
};

import { useState } from "react";

export function useDashboardFilters() {
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    accountId: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  return [filters, setFilters] as const;
}

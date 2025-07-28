"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  Plane,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import {
  createTransaction,
  deleteTransaction,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { ConfirmDeleteModal } from "@/components/dashboard/ConfirmDeleteModal";
import { ProtectedRoute, ErrorBoundary } from "@/components/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster } from "@/components/ui/toast";
import toast from "react-hot-toast";
import CategoryManagementModal from "@/components/dashboard/AddCategoryModal";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";

// Quick add categories with icons
const QUICK_ADD_CATEGORIES = [
  { id: 1, name: "Food", icon: Utensils, amount: 100, categoryType: "EXPENSE" },
  { id: 2, name: "Travel", icon: Car, amount: 200, categoryType: "EXPENSE" },
  {
    id: 3,
    name: "Shopping",
    icon: ShoppingBag,
    amount: 500,
    categoryType: "EXPENSE",
  },
  { id: 4, name: "Home", icon: Home, amount: 1000, categoryType: "EXPENSE" },
  { id: 5, name: "Health", icon: Heart, amount: 300, categoryType: "EXPENSE" },
  {
    id: 6,
    name: "Education",
    icon: GraduationCap,
    amount: 800,
    categoryType: "EXPENSE",
  },
  {
    id: 7,
    name: "Entertainment",
    icon: Gamepad2,
    amount: 400,
    categoryType: "EXPENSE",
  },
  { id: 8, name: "Travel", icon: Plane, amount: 2000, categoryType: "EXPENSE" },
];

export default function TransactionPage() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "",
    accountId: "",
    type: "",
    startDate: "",
    endDate: "",
  });

  const {
    transactions,
    transactionsPagination: pagination,
    transactionsLoading,
    fetchTransactions,
    categories,
    categoriesLoading,
    fetchCategories,
    accounts,
    accountsLoading,
    fetchAccounts,
  } = useGlobalStore();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const accessToken = await getToken();
      if (!accessToken) return;

      await Promise.all([
        fetchCategories(accessToken),
        fetchAccounts(accessToken),
      ]);
    };

    loadData();
  }, [getToken, fetchCategories, fetchAccounts]);

  // Fetch transactions when filters or page changes
  useEffect(() => {
    const loadTransactions = async () => {
      const accessToken = await getToken();
      if (!accessToken) return;

      const params = {
        ...filters,
        search: searchTerm,
        page: currentPage,
        limit: 10,
      };

      await fetchTransactions(accessToken, params);
    };

    loadTransactions();
  }, [getToken, fetchTransactions, filters, searchTerm, currentPage]);

  const handleTransactionAdded = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;

    // Reset to first page and refetch
    setCurrentPage(1);
    const params = {
      ...filters,
      search: searchTerm,
      page: 1,
      limit: 10,
    };
    await fetchTransactions(accessToken, params);
    toast.success("Transaction added successfully");
  }, [getToken, fetchTransactions, filters, searchTerm]);

  const handleTransactionUpdated = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;

    const params = {
      ...filters,
      search: searchTerm,
      page: currentPage,
      limit: 10,
    };
    await fetchTransactions(accessToken, params);
    setEditingTransaction(null);
    toast.success("Transaction updated successfully");
  }, [getToken, fetchTransactions, filters, searchTerm, currentPage]);

  const handleTransactionDeleted = useCallback(
    async (id: string) => {
      try {
        const accessToken = await getToken();
        if (!accessToken) return;

        await deleteTransaction(id, accessToken);
        const params = {
          ...filters,
          search: searchTerm,
          page: currentPage,
          limit: 10,
        };
        await fetchTransactions(accessToken, params);
        setDeleteTxId(null);
        toast.success("Transaction deleted successfully");
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Error deleting transaction");
        setDeleteTxId(null);
      }
    },
    [getToken, fetchTransactions, filters, searchTerm, currentPage]
  );

  // Category management handlers
  const handleAddCategory = async (form: { name: string; type: string }) => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;
      await createCategory(
        { ...form, type: form.type.toUpperCase() },
        accessToken
      );
      await fetchCategories(accessToken);
      toast.success("Category added successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error("Error adding category");
      throw error;
    }
  };

  const handleEditCategory = async (
    id: string,
    form: { name: string; type: string }
  ) => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;
      await updateCategory(
        id,
        { ...form, type: form.type.toUpperCase() },
        accessToken
      );
      await fetchCategories(accessToken);
      toast.success("Category updated successfully");
    } catch (error: any) {
      console.error("Error editing category:", error);
      toast.error("Error updating category");
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;
      await deleteCategory(id, accessToken);
      await fetchCategories(accessToken);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
      throw error;
    }
  };

  // Account management handler
  const handleAccountAdded = async () => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;
      await fetchAccounts(accessToken);
      toast.success("Account added successfully");
    } catch (error) {
      console.error("Error refreshing accounts:", error);
      toast.error("Error refreshing accounts");
    }
  };

  // Normalize categories for the modal
  const normalizedCategories =
    categories?.map((cat: any) => ({
      ...cat,
      type: cat.type?.toUpperCase() || "EXPENSE",
    })) || [];

  const handleQuickAdd = (quickCategory: any) => {
    // Find matching category
    const matchingCategory = categories?.find(
      (cat: any) =>
        cat.name.toLowerCase().includes(quickCategory.name.toLowerCase()) &&
        cat.type === quickCategory.categoryType
    );

    if (matchingCategory) {
      setEditingTransaction({
        amount: quickCategory.amount,
        categoryId: matchingCategory.id,
        category: matchingCategory,
        description: quickCategory.name,
        isQuickAdd: true,
      });
    } else {
      toast.error(
        `Category "${quickCategory.name}" not found, please create a category first`
      );
    }
  };

  const handleExport = async () => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      // Create CSV content
      const headers = [
        "Date",
        "Category",
        "Account",
        "Description",
        "Amount",
        "Type",
      ];
      const csvContent = [
        headers.join(","),
        ...(transactions || []).map((tx: any) =>
          [
            new Date(tx.date).toLocaleDateString("th-TH"),
            tx.category?.name || "",
            tx.account?.name || "",
            tx.description || "",
            tx.amount,
            tx.type === "INCOME" ? "Income" : "Expense",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Exported data successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Error exporting data");
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = Number(amount).toLocaleString();
    return type === "INCOME" ? `+฿${formatted}` : `-฿${formatted}`;
  };

  const getAmountColor = (type: string) => {
    return type === "INCOME" ? "text-green-600" : "text-red-600";
  };

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen flex bg-background mt-2">
          <Toaster />
          <DashboardSidebar clerkUser={clerkUser} />
          <main className="flex-1 p-8 bg-background overflow-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1 text-foreground">
                  Transactions
                </h1>
                <p className="text-muted-foreground">
                  Manage your income and expense transactions
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setAddTransactionOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>

                <AddAccountModal onAdded={handleAccountAdded} />

                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
            {/* Quick Add Buttons */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Add
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {QUICK_ADD_CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(category)}
                        className="flex flex-col items-center gap-1 h-auto py-3 px-2"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs">{category.name}</span>
                        <span className="text-xs font-medium">
                          ฿{category.amount}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search and Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select
                    value={filters.categoryId}
                    onChange={(e) =>
                      setFilters({ ...filters, categoryId: e.target.value })
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.accountId}
                    onChange={(e) =>
                      setFilters({ ...filters, accountId: e.target.value })
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Accounts</option>
                    {accounts?.map((acc: any) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                  <Button
                    onClick={() =>
                      setFilters({
                        categoryId: "",
                        accountId: "",
                        type: "",
                        startDate: "",
                        endDate: "",
                      })
                    }
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Your Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : transactions && transactions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Category</th>
                            <th className="text-left py-3 px-4">Account</th>
                            <th className="text-left py-3 px-4">Description</th>
                            <th className="text-right py-3 px-4">Amount</th>
                            <th className="text-center py-3 px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction: any) => (
                            <tr
                              key={transaction.id}
                              className="border-b hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              <td className="py-3 px-4">
                                {new Date(transaction.date).toLocaleDateString(
                                  "th-TH"
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    transaction.type === "INCOME"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {transaction.category?.name || "No category"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {transaction.account?.name || "No account"}
                              </td>
                              <td className="py-3 px-4">
                                {transaction.description || "-"}
                              </td>
                              <td
                                className={`py-3 px-4 text-right font-semibold ${getAmountColor(
                                  transaction.type
                                )}`}
                              >
                                {formatAmount(
                                  transaction.amount,
                                  transaction.type
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setEditingTransaction(transaction)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteTxId(transaction.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-muted-foreground">
                          Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                          to{" "}
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}{" "}
                          from {pagination.total} transactions
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-2 text-sm">
                            Page {pagination.page} of {pagination.pages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === pagination.pages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Transaction Modal */}
            <TransactionModal
              open={addTransactionOpen || !!editingTransaction}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  setAddTransactionOpen(false);
                  setEditingTransaction(null);
                }
              }}
              onAdded={handleTransactionAdded}
              onUpdated={handleTransactionUpdated}
              transaction={editingTransaction}
              categories={categories}
            />
            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
              open={!!deleteTxId}
              onConfirm={() =>
                deleteTxId && handleTransactionDeleted(deleteTxId)
              }
              onCancel={() => setDeleteTxId(null)}
            />
            {/* Category Management Modal */}
            <CategoryManagementModal
              open={isCategoryModalOpen}
              categories={normalizedCategories}
              onClose={() => setIsCategoryModalOpen(false)}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </main>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

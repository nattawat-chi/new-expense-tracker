"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import { createBudget, updateBudget, deleteBudget } from "@/lib/api";
import { EditBudgetModal } from "@/components/dashboard/EditBudgetModal";
import { ProtectedRoute, ErrorBoundary } from "@/components/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster } from "@/components/ui/toast";
import toast from "react-hot-toast";

export default function BudgetPage() {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const {
    budgets,
    budgetsLoading,
    fetchBudgets,
    categories,
    categoriesLoading,
    fetchCategories,
    stats,
    statsLoading,
    fetchStats,
  } = useGlobalStore();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const accessToken = await getToken();
      if (!accessToken) return;

      await Promise.all([
        fetchBudgets(accessToken),
        fetchCategories(accessToken),
        fetchStats(accessToken),
      ]);
    };

    loadData();
  }, [getToken, fetchBudgets, fetchCategories, fetchStats]);

  const handleBudgetAdded = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;
    await fetchBudgets(accessToken);
    toast.success("Your budget has been added");
  }, [getToken, fetchBudgets]);

  const handleBudgetUpdated = useCallback(async () => {
    const accessToken = await getToken();
    if (!accessToken) return;
    await fetchBudgets(accessToken);
    setEditingBudget(null);
    toast.success("Your budget has been updated");
  }, [getToken, fetchBudgets]);

  const handleBudgetDeleted = useCallback(
    async (budgetId: string) => {
      try {
        const accessToken = await getToken();
        if (!accessToken) return;

        await deleteBudget(budgetId, accessToken);
        await fetchBudgets(accessToken);
        toast.success("Your budget has been deleted");
      } catch (error) {
        console.error("Error deleting budget:", error);
        toast.error("Error deleting budget");
      }
    },
    [getToken, fetchBudgets]
  );

  // Get expense categories for budget setting
  const expenseCategories =
    categories?.filter((cat: any) => cat.type === "EXPENSE") || [];

  // Calculate total budget and spending
  const totalBudget =
    budgets?.reduce(
      (sum: number, budget: any) => sum + Number(budget.amount),
      0
    ) || 0;
  const totalSpent =
    budgets?.reduce(
      (sum: number, budget: any) => sum + Number(budget.spent),
      0
    ) || 0;
  const totalRemaining = totalBudget - totalSpent;
  const totalPercentageUsed =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get current month's budget
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthBudgets =
    budgets?.filter((budget: any) => {
      const budgetDate = new Date(budget.startDate);
      return (
        budgetDate.getMonth() === currentMonth &&
        budgetDate.getFullYear() === currentYear
      );
    }) || [];

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
                  Manage Budget
                </h1>
                <p className="text-muted-foreground">
                  Set up category budgets and track spending
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setAddBudgetOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Budget
                </Button>
              </div>
            </div>

            {/* Overall Budget Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Budget Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ฿{totalBudget.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Budget
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      ฿{totalSpent.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Spent</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ฿{totalRemaining.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Remaining
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {totalPercentageUsed.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Spent</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Budget Progress</span>
                    <span className="font-semibold">
                      {totalPercentageUsed.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(totalPercentageUsed, 100)}
                    className={totalPercentageUsed > 100 ? "bg-red-100" : ""}
                  />
                  {totalPercentageUsed > 100 && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      You've exceeded your budget! Please adjust your budget or
                      reduce spending
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Budgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets?.map((budget: any) => {
                const percentageUsed = budget.percentageUsed || 0;
                const isOverBudget = budget.isOverBudget;
                const isNearLimit = budget.isNearLimit;
                const remaining = Number(budget.amount) - Number(budget.spent);

                return (
                  <Card key={budget.id} className="relative w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {budget.category?.name || "Total Budget"}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBudget(budget)}
                            className="h-6 w-6 p-0"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </span>
                        <div className="flex gap-1">
                          {isOverBudget && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Over Budget
                            </Badge>
                          )}
                          {isNearLimit && !isOverBudget && (
                            <Badge variant="secondary" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Close to End
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-4 text-sm w-full justify-between">
                          <div>
                            <div className="text-muted-foreground">Budget</div>
                            <div className="font-semibold">
                              ฿{Number(budget.amount).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Spent</div>
                            <div className="font-semibold">
                              ฿{Number(budget.spent).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Remaining</span>
                            <span
                              className={`font-semibold ${
                                remaining < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ฿{remaining.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Percentage</span>
                            <span className="font-semibold">
                              {Number(percentageUsed).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(percentageUsed, 100)}
                            className={isOverBudget ? "bg-red-100" : ""}
                          />
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {new Date(budget.startDate).toLocaleDateString(
                            "th-TH"
                          )}{" "}
                          -{" "}
                          {new Date(budget.endDate).toLocaleDateString("th-TH")}
                        </div>

                        {isOverBudget && (
                          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                              <AlertTriangle className="h-4 w-4" />
                              <span>
                                You've exceeded your budget! Please adjust your
                                budget or reduce spending
                              </span>
                            </div>
                          </div>
                        )}

                        {isNearLimit && !isOverBudget && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-600 text-sm">
                              <AlertTriangle className="h-4 w-4" />
                              <span>
                                Close to End, be careful with spending
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Budget Setup for Categories */}
            {expenseCategories.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Budget Setup for Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenseCategories.map((category: any) => {
                      const existingBudget = budgets?.find(
                        (b: any) => b.categoryId === category.id
                      );

                      return (
                        <div
                          key={category.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{category.name}</span>
                            {existingBudget ? (
                              <Badge variant="secondary">Budget exists</Badge>
                            ) : (
                              <Badge variant="outline">No budget</Badge>
                            )}
                          </div>
                          {existingBudget ? (
                            <div className="text-sm text-muted-foreground">
                              Budget: ฿
                              {Number(existingBudget.amount).toLocaleString()}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingBudget({
                                  categoryId: category.id,
                                  category: category,
                                  isNew: true,
                                });
                              }}
                            >
                              Set Budget
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add/Edit Budget Modal */}
            <EditBudgetModal
              open={addBudgetOpen || !!editingBudget}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  setAddBudgetOpen(false);
                  setEditingBudget(null);
                }
              }}
              onAdded={handleBudgetAdded}
              onUpdated={handleBudgetUpdated}
              editingBudget={editingBudget}
              categories={expenseCategories}
            />
          </main>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

// Get all budgets with category details and spending analysis
router.get("/budgets", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await prisma.transaction.aggregate({
          where: {
            userId,
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
            ...(budget.categoryId && { categoryId: budget.categoryId }),
            type: "EXPENSE", // Only count expenses for budget tracking
          },
          _sum: { amount: true },
        });

        const spent = spending._sum.amount || new Prisma.Decimal(0);
        const remaining = budget.amount.sub(spent);
        const percentageUsed = budget.amount.greaterThan(0)
          ? spent.div(budget.amount).mul(100)
          : new Prisma.Decimal(0);

        return {
          ...budget,
          spent,
          remaining,
          percentageUsed,
          isOverBudget: spent.greaterThan(budget.amount),
          isNearLimit:
            percentageUsed.greaterThan(80) && percentageUsed.lessThan(100),
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

// Create a new budget
router.post("/budgets", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { amount, startDate, endDate, categoryId } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!amount || !startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Amount, startDate, and endDate are required" });
  }

  try {
    const budget = await prisma.budget.create({
      data: {
        amount: new Prisma.Decimal(amount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
        categoryId: categoryId || null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ error: "Failed to create budget" });
  }
});

// Update a budget
router.put(
  "/budgets/:id",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);
    const { amount, startDate, endDate, categoryId } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const existingBudget = await prisma.budget.findUnique({
        where: { id },
      });

      if (!existingBudget) {
        return res.status(404).json({ error: "Budget not found" });
      }

      if (existingBudget.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const budget = await prisma.budget.update({
        where: { id },
        data: {
          amount: amount ? new Prisma.Decimal(amount) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          categoryId: categoryId !== undefined ? categoryId : undefined,
        },
        include: {
          category: true,
        },
      });

      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ error: "Failed to update budget" });
    }
  }
);

// Delete a budget
router.delete(
  "/budgets/:id",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const budget = await prisma.budget.findUnique({
        where: { id },
      });

      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }

      if (budget.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await prisma.budget.delete({
        where: { id },
      });

      res.json({ message: "Budget deleted successfully" });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ error: "Failed to delete budget" });
    }
  }
);

// Get budget alerts (budgets that are near limit or over budget)
router.get(
  "/budgets/alerts",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: {
          category: true,
        },
      });

      const alerts = await Promise.all(
        budgets.map(async (budget) => {
          const spending = await prisma.transaction.aggregate({
            where: {
              userId,
              date: {
                gte: budget.startDate,
                lte: budget.endDate,
              },
              ...(budget.categoryId && { categoryId: budget.categoryId }),
              type: "EXPENSE",
            },
            _sum: { amount: true },
          });

          const spent = spending._sum.amount || new Prisma.Decimal(0);
          const percentageUsed = budget.amount.greaterThan(0)
            ? spent.div(budget.amount).mul(100)
            : new Prisma.Decimal(0);

          return {
            budget,
            spent,
            percentageUsed,
            isOverBudget: spent.greaterThan(budget.amount),
            isNearLimit:
              percentageUsed.greaterThan(80) && percentageUsed.lessThan(100),
            alertType: spent.greaterThan(budget.amount)
              ? "OVER_BUDGET"
              : percentageUsed.greaterThan(80)
              ? "NEAR_LIMIT"
              : null,
          };
        })
      );

      const activeAlerts = alerts.filter((alert) => alert.alertType);
      res.json(activeAlerts);
    } catch (error) {
      console.error("Error fetching budget alerts:", error);
      res.status(500).json({ error: "Failed to fetch budget alerts" });
    }
  }
);

// Get budget vs actual comparison
router.get(
  "/budgets/:id/comparison",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const budget = await prisma.budget.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }

      if (budget.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Get actual spending
      const actualSpending = await prisma.transaction.aggregate({
        where: {
          userId,
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
          ...(budget.categoryId && { categoryId: budget.categoryId }),
          type: "EXPENSE",
        },
        _sum: { amount: true },
        _count: true,
      });

      const spent = actualSpending._sum.amount || new Prisma.Decimal(0);
      const remaining = budget.amount.sub(spent);
      const percentageUsed = budget.amount.greaterThan(0)
        ? spent.div(budget.amount).mul(100)
        : new Prisma.Decimal(0);

      // Get daily spending breakdown
      const dailySpending = await prisma.transaction.groupBy({
        by: ["date"],
        where: {
          userId,
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
          ...(budget.categoryId && { categoryId: budget.categoryId }),
          type: "EXPENSE",
        },
        _sum: { amount: true },
        orderBy: {
          date: "asc",
        },
      });

      res.json({
        budget,
        actual: {
          spent,
          count: actualSpending._count,
          remaining,
          percentageUsed,
          isOverBudget: spent.greaterThan(budget.amount),
        },
        dailyBreakdown: dailySpending.map((day) => ({
          date: day.date,
          amount: day._sum.amount,
        })),
      });
    } catch (error) {
      console.error("Error fetching budget comparison:", error);
      res.status(500).json({ error: "Failed to fetch budget comparison" });
    }
  }
);

export default router;

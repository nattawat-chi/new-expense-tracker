import { Router, Request, Response } from "express";
import { PrismaClient, TransactionType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

// Get all categories with transaction counts and totals
router.get(
  "/categories",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = getAuth(req);
      const userId = typeof rawUserId === "string" ? rawUserId : undefined;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // ดึงเฉพาะ category ของ user นี้
      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });

      // Get statistics for each category
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const stats = await prisma.transaction.aggregate({
            where: {
              categoryId: category.id,
              userId,
            },
            _sum: { amount: true },
            _count: true,
          });

          const monthlyStats = await prisma.transaction.aggregate({
            where: {
              categoryId: category.id,
              userId,
              date: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
            _sum: { amount: true },
            _count: true,
          });

          return {
            ...category,
            totalAmount: stats._sum.amount || 0,
            totalCount: stats._count,
            monthlyAmount: monthlyStats._sum.amount || 0,
            monthlyCount: monthlyStats._count,
          };
        })
      );

      res.json(categoriesWithStats);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }
);

// Create a new category
router.post(
  "/categories",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = getAuth(req);
      const userId = typeof rawUserId === "string" ? rawUserId : undefined;
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }

      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // Check if category already exists (composite key)
      const existingCategory = await prisma.category.findUnique({
        where: { userId_name: { userId, name } },
      });

      if (existingCategory) {
        return res
          .status(400)
          .json({ error: "Category with this name already exists" });
      }

      const category = await prisma.category.create({
        data: { name, type, userId },
      });
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);

// Update a category
router.put(
  "/categories/:id",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = getAuth(req);
      const userId = typeof rawUserId === "string" ? rawUserId : undefined;
      const { id } = req.params;
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }

      // Check if category with new name already exists (excluding current category, unique per user)
      const existingCategory = await prisma.category.findFirst({
        where: {
          name,
          userId,
          id: { not: id },
        },
      });

      if (existingCategory) {
        return res
          .status(400)
          .json({ error: "Category with this name already exists" });
      }

      // Ensure user owns the category
      const categoryToUpdate = await prisma.category.findUnique({
        where: { id },
      });
      if (!categoryToUpdate || categoryToUpdate.userId !== userId) {
        return res.status(404).json({ error: "Category not found" });
      }

      const category = await prisma.category.update({
        where: { id },
        data: { name, type },
      });
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);

// Delete a category
router.delete(
  "/categories/:id",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = getAuth(req);
      const userId = typeof rawUserId === "string" ? rawUserId : undefined;
      const { id } = req.params;

      // Ensure user owns the category
      const categoryToDelete = await prisma.category.findUnique({
        where: { id },
      });
      if (!categoryToDelete || categoryToDelete.userId !== userId) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Check if category has transactions
      const transactionCount = await prisma.transaction.count({
        where: { categoryId: id, userId },
      });

      if (transactionCount > 0) {
        return res.status(400).json({
          error:
            "Cannot delete category that has transactions. Please reassign or delete transactions first.",
        });
      }

      // Check if category has budgets
      const budgetCount = await prisma.budget.count({
        where: { categoryId: id, userId },
      });

      if (budgetCount > 0) {
        return res.status(400).json({
          error:
            "Cannot delete category that has budgets. Please delete or update budgets first.",
        });
      }

      await prisma.category.delete({
        where: { id },
      });

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);

// Get category statistics
router.get(
  "/categories/stats",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = getAuth(req);
      const userId = typeof rawUserId === "string" ? rawUserId : undefined;
      const { startDate, endDate } = req.query;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const where: any = { userId };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      // Get category breakdown by type
      const categoryBreakdown = await prisma.transaction.groupBy({
        by: ["categoryId", "type"],
        where,
        _sum: { amount: true },
        _count: true,
      });

      // Get category details
      const categoryIds = [
        ...new Set(categoryBreakdown.map((stat) => stat.categoryId)),
      ];
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const stats = categoryBreakdown.map((stat) => {
        const category = categories.find((cat) => cat.id === stat.categoryId);
        return {
          categoryId: stat.categoryId,
          categoryName: category?.name || "Unknown",
          type: stat.type,
          totalAmount: stat._sum.amount,
          count: stat._count,
        };
      });

      // Group by category
      const categoryStats = categories.map((category) => {
        const incomeStats = stats.find(
          (s) => s.categoryId === category.id && s.type === "INCOME"
        );
        const expenseStats = stats.find(
          (s) => s.categoryId === category.id && s.type === "EXPENSE"
        );

        return {
          id: category.id,
          name: category.name,
          type: category.type,
          income: {
            amount: incomeStats?.totalAmount || 0,
            count: incomeStats?.count || 0,
          },
          expense: {
            amount: expenseStats?.totalAmount || 0,
            count: expenseStats?.count || 0,
          },
        };
      });

      res.json(categoryStats);
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ error: "Failed to fetch category statistics" });
    }
  }
);

// Get top spending categories
router.get(
  "/categories/top-spending",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = getAuth(req);
      const userId = typeof rawUserId === "string" ? rawUserId : undefined;
      const { limit = 5, period = "month" } = req.query;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const where: any = {
        userId,
        type: "EXPENSE",
      };

      // Add date filter based on period
      if (period === "month") {
        where.date = {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        };
      } else if (period === "year") {
        where.date = {
          gte: new Date(new Date().getFullYear(), 0, 1),
        };
      }

      const topCategories = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where,
        _sum: { amount: true },
        _count: true,
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: Number(limit),
      });

      // Get category details
      const categoryIds = topCategories.map((stat) => stat.categoryId);
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const result = topCategories.map((stat) => {
        const category = categories.find((cat) => cat.id === stat.categoryId);
        return {
          categoryId: stat.categoryId,
          categoryName: category?.name || "Unknown",
          totalAmount: stat._sum.amount,
          count: stat._count,
        };
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching top spending categories:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch top spending categories" });
    }
  }
);

export default router;

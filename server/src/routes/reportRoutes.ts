import { Router, Request, Response } from "express";
import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

// Get monthly report
router.get(
  "/reports/monthly",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { year, month } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const targetYear = Number(year) || new Date().getFullYear();
      const targetMonth = Number(month) || new Date().getMonth();

      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0);

      const [incomeStats, expenseStats, categoryBreakdown, dailyBreakdown] =
        await Promise.all([
          // Income statistics
          prisma.transaction.aggregate({
            where: {
              userId,
              type: TransactionType.INCOME,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
            _avg: { amount: true },
          }),
          // Expense statistics
          prisma.transaction.aggregate({
            where: {
              userId,
              type: TransactionType.EXPENSE,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
            _avg: { amount: true },
          }),
          // Category breakdown
          prisma.transaction.groupBy({
            by: ["categoryId", "type"],
            where: {
              userId,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
          // Daily breakdown
          prisma.transaction.groupBy({
            by: ["date", "type"],
            where: {
              userId,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
            orderBy: { date: "asc" },
          }),
        ]);

      // Get category details
      const categoryIds = [
        ...new Set(categoryBreakdown.map((stat) => stat.categoryId)),
      ];
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const categoryStats = categoryBreakdown.map((stat) => {
        const category = categories.find((cat) => cat.id === stat.categoryId);
        return {
          categoryId: stat.categoryId,
          categoryName: category?.name || "Unknown",
          type: stat.type,
          totalAmount: stat._sum.amount,
          count: stat._count,
        };
      });

      // Process daily breakdown
      const dailyStats = dailyBreakdown.reduce((acc, day) => {
        const dateKey = day.date.toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = {
            income: 0,
            expense: 0,
            incomeCount: 0,
            expenseCount: 0,
          };
        }
        if (day.type === TransactionType.INCOME) {
          acc[dateKey].income += Number(day._sum.amount);
          acc[dateKey].incomeCount += day._count;
        } else {
          acc[dateKey].expense += Number(day._sum.amount);
          acc[dateKey].expenseCount += day._count;
        }
        return acc;
      }, {} as Record<string, { income: number; expense: number; incomeCount: number; expenseCount: number }>);

      res.json({
        period: {
          year: targetYear,
          month: targetMonth,
          startDate,
          endDate,
        },
        summary: {
          income: {
            total: incomeStats._sum.amount || 0,
            count: incomeStats._count,
            average: incomeStats._avg.amount || 0,
          },
          expense: {
            total: expenseStats._sum.amount || 0,
            count: expenseStats._count,
            average: expenseStats._avg.amount || 0,
          },
          net:
            Number(incomeStats._sum.amount || 0) -
            Number(expenseStats._sum.amount || 0),
        },
        categoryBreakdown: categoryStats,
        dailyBreakdown: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats,
        })),
      });
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ error: "Failed to generate monthly report" });
    }
  }
);

// Get yearly report
router.get(
  "/reports/yearly",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { year } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const targetYear = Number(year) || new Date().getFullYear();
      const startDate = new Date(targetYear, 0, 1);
      const endDate = new Date(targetYear, 11, 31);

      const [incomeStats, expenseStats, monthlyBreakdown, categoryBreakdown] =
        await Promise.all([
          // Income statistics
          prisma.transaction.aggregate({
            where: {
              userId,
              type: TransactionType.INCOME,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
            _avg: { amount: true },
          }),
          // Expense statistics
          prisma.transaction.aggregate({
            where: {
              userId,
              type: TransactionType.EXPENSE,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
            _avg: { amount: true },
          }),
          // Monthly breakdown
          prisma.transaction.groupBy({
            by: ["type"],
            where: {
              userId,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
          // Category breakdown
          prisma.transaction.groupBy({
            by: ["categoryId", "type"],
            where: {
              userId,
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
        ]);

      // Get monthly data for each month
      const monthlyData = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(targetYear, month, 1);
        const monthEnd = new Date(targetYear, month + 1, 0);

        const monthStats = await prisma.transaction.aggregate({
          where: {
            userId,
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
          _count: true,
        });

        const monthIncome = await prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.INCOME,
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        const monthExpense = await prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.EXPENSE,
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        monthlyData.push({
          month: month + 1,
          monthName: monthStart.toLocaleString("default", { month: "long" }),
          income: monthIncome._sum.amount || 0,
          expense: monthExpense._sum.amount || 0,
          net:
            Number(monthIncome._sum.amount || 0) -
            Number(monthExpense._sum.amount || 0),
          count: monthStats._count,
        });
      }

      // Get category details
      const categoryIds = [
        ...new Set(categoryBreakdown.map((stat) => stat.categoryId)),
      ];
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const categoryStats = categoryBreakdown.map((stat) => {
        const category = categories.find((cat) => cat.id === stat.categoryId);
        return {
          categoryId: stat.categoryId,
          categoryName: category?.name || "Unknown",
          type: stat.type,
          totalAmount: stat._sum.amount,
          count: stat._count,
        };
      });

      res.json({
        period: {
          year: targetYear,
          startDate,
          endDate,
        },
        summary: {
          income: {
            total: incomeStats._sum.amount || 0,
            count: incomeStats._count,
            average: incomeStats._avg.amount || 0,
          },
          expense: {
            total: expenseStats._sum.amount || 0,
            count: expenseStats._count,
            average: expenseStats._avg.amount || 0,
          },
          net:
            Number(incomeStats._sum.amount || 0) -
            Number(expenseStats._sum.amount || 0),
        },
        monthlyBreakdown: monthlyData,
        categoryBreakdown: categoryStats,
      });
    } catch (error) {
      console.error("Error generating yearly report:", error);
      res.status(500).json({ error: "Failed to generate yearly report" });
    }
  }
);

// Get spending trends
router.get(
  "/reports/trends",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { period = "6months" } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      let startDate: Date;
      const endDate = new Date();

      switch (period) {
        case "3months":
          startDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth() - 3,
            1
          );
          break;
        case "6months":
          startDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth() - 6,
            1
          );
          break;
        case "1year":
          startDate = new Date(
            endDate.getFullYear() - 1,
            endDate.getMonth(),
            1
          );
          break;
        default:
          startDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth() - 6,
            1
          );
      }

      // Get monthly trends
      const monthlyTrends = await prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      });

      // Get category trends
      const categoryTrends = await prisma.transaction.groupBy({
        by: ["categoryId", "type"],
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: 10,
      });

      // Get category details
      const categoryIds = [
        ...new Set(categoryTrends.map((stat) => stat.categoryId)),
      ];
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const categoryStats = categoryTrends.map((stat) => {
        const category = categories.find((cat) => cat.id === stat.categoryId);
        return {
          categoryId: stat.categoryId,
          categoryName: category?.name || "Unknown",
          type: stat.type,
          totalAmount: stat._sum.amount,
          count: stat._count,
        };
      });

      res.json({
        period: {
          startDate,
          endDate,
          period,
        },
        summary: monthlyTrends.reduce((acc, trend) => {
          acc[trend.type.toLowerCase()] = {
            total: trend._sum.amount,
            count: trend._count,
          };
          return acc;
        }, {} as Record<string, { total: any; count: number }>),
        topCategories: categoryStats,
      });
    } catch (error) {
      console.error("Error generating trends report:", error);
      res.status(500).json({ error: "Failed to generate trends report" });
    }
  }
);

// Export transactions to CSV
router.get(
  "/reports/export",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { startDate, endDate, format = "csv" } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const where: any = { userId };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          account: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      if (format === "csv") {
        const csvHeader =
          "Date,Type,Amount,Description,Category,Account,Tags\n";
        const csvRows = transactions
          .map((tx) => {
            const tags = tx.tags.map((t) => t.tag.name).join("; ");
            return `"${tx.date.toISOString().split("T")[0]}","${tx.type}","${
              tx.amount
            }","${tx.description || ""}","${tx.category.name}","${
              tx.account.name
            }","${tags}"`;
          })
          .join("\n");

        const csv = csvHeader + csvRows;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="transactions-${
            new Date().toISOString().split("T")[0]
          }.csv"`
        );
        res.send(csv);
      } else {
        res.json(transactions);
      }
    } catch (error) {
      console.error("Error exporting transactions:", error);
      res.status(500).json({ error: "Failed to export transactions" });
    }
  }
);

export default router;

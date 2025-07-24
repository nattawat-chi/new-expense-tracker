import { Router, Request, Response } from "express";
import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

// Get all transactions with search and filter
router.get(
  "/transactions",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const {
      search,
      categoryId,
      accountId,
      type,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
    } = req.query;

    console.log("userId from Clerk:", userId);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const where: any = { userId };

      // Search by description
      if (search) {
        where.description = {
          contains: search as string,
          mode: "insensitive",
        };
      }

      // Filter by category
      if (categoryId) {
        where.categoryId = categoryId as string;
      }

      // Filter by account
      if (accountId) {
        where.accountId = accountId as string;
      }

      // Filter by type
      if (type) {
        where.type = type as TransactionType;
      }

      // Filter by date range
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      // Filter by amount range
      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount)
          where.amount.gte = new Prisma.Decimal(minAmount as string);
        if (maxAmount)
          where.amount.lte = new Prisma.Decimal(maxAmount as string);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
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
          skip,
          take: Number(limit),
        }),
        prisma.transaction.count({ where }),
      ]);

      console.log("transactions found:", transactions.length);
      res.json({
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
);

// Get transaction statistics
router.get(
  "/transactions/stats",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { startDate, endDate } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const where: any = { userId };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      const [incomeStats, expenseStats, categoryStats] = await Promise.all([
        // Income statistics
        prisma.transaction.aggregate({
          where: { ...where, type: TransactionType.INCOME },
          _sum: { amount: true },
          _count: true,
          _avg: { amount: true },
        }),
        // Expense statistics
        prisma.transaction.aggregate({
          where: { ...where, type: TransactionType.EXPENSE },
          _sum: { amount: true },
          _count: true,
          _avg: { amount: true },
        }),
        // Category breakdown
        prisma.transaction.groupBy({
          by: ["categoryId", "type"],
          where,
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Get category details for the breakdown
      const categoryIds = [
        ...new Set(categoryStats.map((stat) => stat.categoryId)),
      ];
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const categoryBreakdown = categoryStats.map((stat) => {
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
        categoryBreakdown,
      });
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      res.status(500).json({ error: "Failed to fetch transaction statistics" });
    }
  }
);

// Create a Transaction (สำคัญ: การอัปเดต Budget และ Account Balance)
router.post(
  "/transactions",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { amount, description, date, accountId, categoryId, tagIds, type } =
      req.body;
    const { userId } = getAuth(req);

    if (!amount || !userId || !accountId || !categoryId) {
      return res.status(400).json({
        error:
          "Amount, accountId, categoryId are required and user must be authenticated.",
      });
    }

    try {
      // 1. ดึง Category เพื่อตรวจสอบประเภท (type) และ TransactionType ที่ถูกต้อง
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found." });
      }

      const transactionType = type || category.type; // ใช้ type ที่ส่งมา หรือจาก category

      // 2. สร้าง Transaction
      const newTransaction = await prisma.transaction.create({
        data: {
          amount: new Prisma.Decimal(amount), // แปลงเป็น Prisma.Decimal
          type: transactionType,
          description,
          date: date ? new Date(date) : new Date(),
          userId,
          accountId,
          categoryId,
          tags: {
            create: tagIds ? tagIds.map((tagId: string) => ({ tagId })) : [], // สร้างความสัมพันธ์กับ Tag
          },
        },
        include: {
          account: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // 3. อัปเดต Account Balance
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance:
            transactionType === TransactionType.INCOME
              ? { increment: new Prisma.Decimal(amount) }
              : { decrement: new Prisma.Decimal(amount) },
        },
      });

      // 4. อัปเดต Budget.spent (Logic ตัวอย่าง)
      const transactionDate = date ? new Date(date) : new Date();
      // ค้นหา Budget ที่เกี่ยวข้อง
      const relatedBudgets = await prisma.budget.findMany({
        where: {
          userId: userId,
          startDate: { lte: transactionDate }, // transactionDate อยู่หลังหรือตรงกับ startDate
          endDate: { gte: transactionDate }, // transactionDate อยู่ก่อนหรือตรงกับ endDate
          OR: [
            { categoryId: categoryId }, // Budget สำหรับ Category นี้
            { categoryId: null }, // หรือ Budget โดยรวม
          ],
        },
      });

      for (const budget of relatedBudgets) {
        // เราจะเพิ่มเข้า spent เสมอไม่ว่าจะเป็น Income หรือ Expense
        // เพราะ Budget คือการติดตามว่าใช้ไปเท่าไหร่ (รวมทั้ง Income ที่เข้ามาใน Budget)
        // หรือคุณอาจปรับ Logic นี้ให้เฉพาะ Expense เท่านั้น ขึ้นอยู่กับ Business Logic ของคุณ
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            spent: {
              increment: new Prisma.Decimal(amount),
            },
          },
        });
      }

      res.status(201).json(newTransaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error?.message || error);
      res.status(500).json({ error: "Failed to create transaction." });
    }
  }
);

// Update a transaction
router.put(
  "/transactions/:id",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, description, date, accountId, categoryId, tagIds, type } =
      req.body;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      // Get the original transaction to calculate balance adjustments
      const originalTransaction = await prisma.transaction.findUnique({
        where: { id },
        include: { account: true, category: true },
      });

      if (!originalTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (originalTransaction.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Revert the original transaction's effect on account balance
      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: {
          balance:
            originalTransaction.type === TransactionType.INCOME
              ? { decrement: originalTransaction.amount }
              : { increment: originalTransaction.amount },
        },
      });

      // Update the transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          amount: amount ? new Prisma.Decimal(amount) : undefined,
          type: type || originalTransaction.type,
          description: description !== undefined ? description : undefined,
          date: date ? new Date(date) : undefined,
          accountId: accountId || originalTransaction.accountId,
          categoryId: categoryId || originalTransaction.categoryId,
          tags: {
            deleteMany: {},
            create: tagIds ? tagIds.map((tagId: string) => ({ tagId })) : [],
          },
        },
        include: {
          account: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Apply the new transaction's effect on account balance
      const newAccountId = accountId || originalTransaction.accountId;
      await prisma.account.update({
        where: { id: newAccountId },
        data: {
          balance:
            updatedTransaction.type === TransactionType.INCOME
              ? { increment: updatedTransaction.amount }
              : { decrement: updatedTransaction.amount },
        },
      });

      res.json(updatedTransaction);
    } catch (error: any) {
      console.error("Error updating transaction:", error?.message || error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  }
);

// Delete a transaction
router.delete(
  "/transactions/:id",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { account: true },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Revert the transaction's effect on account balance
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance:
            transaction.type === TransactionType.INCOME
              ? { decrement: transaction.amount }
              : { increment: transaction.amount },
        },
      });

      // Delete the transaction
      await prisma.transaction.delete({
        where: { id },
      });

      res.json({ message: "Transaction deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting transaction:", error?.message || error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  }
);

// Get Transactions by User ID
router.get(
  "/users/:userId/transactions",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        include: {
          account: true,
          category: true,
          tags: {
            include: {
              tag: true, // ดึงข้อมูล Tag จริงๆ ด้วย
            },
          },
        },
        orderBy: {
          date: "desc", // เรียงตามวันที่ล่าสุดก่อน
        },
      });
      res.status(200).json(transactions);
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error instanceof Error ? error.message : error
      );
      res.status(500).json({ error: "Failed to fetch transactions." });
    }
  }
);

// Dashboard summary endpoint
router.get(
  "/dashboard/summary",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Query params for pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      // 1. Transactions (with category, account, tags)
      const [transactions, totalTx] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          skip: offset,
          take: limit,
          include: {
            category: true,
            account: true,
            tags: {
              include: { tag: true },
            },
          },
        }),
        prisma.transaction.count({ where: { userId } }),
      ]);

      // 2. Transaction stats (income/expense sum)
      const [incomeStats, expenseStats] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: "INCOME" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE" },
          _sum: { amount: true },
        }),
      ]);
      const transactionStats = {
        income: { total: Number(incomeStats._sum.amount || 0) },
        expense: { total: Number(expenseStats._sum.amount || 0) },
      };

      // 3. Accounts
      const accounts = await prisma.account.findMany({ where: { userId } });

      // 4. Categories
      const categories = await prisma.category.findMany();

      // 5. Budgets (with category)
      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      });

      // 6. Budget alerts (ตัวอย่าง: งบที่ใช้เกิน 90% หรือเกินงบ)
      const budgetAlerts = budgets.filter(
        (b: any) => b.spent / b.amount >= 0.9 || b.spent > b.amount
      );

      // 7. Top spending categories (เดือนนี้)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const topCategoriesRaw = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      });
      const topCategories = await Promise.all(
        topCategoriesRaw.map(async (item) => {
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId || undefined },
          });
          return {
            categoryId: item.categoryId,
            categoryName: category?.name || "",
            totalAmount: Number(item._sum.amount || 0),
          };
        })
      );

      // 8. Monthly report (daily breakdown)
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const dailyBreakdown: any[] = [];
      for (let d = 1; d <= endOfMonth.getDate(); d++) {
        const date = new Date(now.getFullYear(), now.getMonth(), d);
        const [income, expense] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              userId,
              type: "INCOME",
              date: {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lte: new Date(date.setHours(23, 59, 59, 999)),
              },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId,
              type: "EXPENSE",
              date: {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lte: new Date(date.setHours(23, 59, 59, 999)),
              },
            },
            _sum: { amount: true },
          }),
        ]);
        dailyBreakdown.push({
          date: date.toISOString().split("T")[0],
          income: Number(income._sum.amount || 0),
          expense: Number(expense._sum.amount || 0),
        });
      }
      const monthlyReport = { dailyBreakdown };

      res.json({
        transactions,
        pagination: {
          page,
          limit,
          total: totalTx,
          pages: Math.ceil(totalTx / limit),
        },
        transactionStats,
        accounts,
        categories,
        budgets,
        budgetAlerts,
        topCategories,
        monthlyReport,
      });
    } catch (err) {
      console.error("/dashboard/summary error", err);
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  }
);

export default router;

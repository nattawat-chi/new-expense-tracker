import { Router, Request, Response } from "express";
import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

router.get(
  "/transactions",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    console.log("userId from Clerk:", userId);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        account: true,
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    console.log("transactions found:", transactions.length);
    res.json(transactions);
  }
);

// Create a Transaction (สำคัญ: การอัปเดต Budget และ Account Balance)
router.post(
  "/transactions",
  requireAuth(),
  async (req: Request, res: Response) => {
    const { amount, description, date, accountId, categoryId, tagIds } =
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

      const transactionType = category.type; // ใช้ type จาก category

      // 2. สร้าง Transaction
      const newTransaction = await prisma.transaction.create({
        data: {
          amount: new Prisma.Decimal(amount), // แปลงเป็น Prisma.Decimal
          type: transactionType,
          description,
          date: date ? new Date(date) : new Date(), // ใช้ Date ที่ส่งมา หรือใช้ปัจจุบัน
          userId,
          accountId,
          categoryId,
          tags: {
            create: tagIds ? tagIds.map((tagId: string) => ({ tagId })) : [], // สร้างความสัมพันธ์กับ Tag
          },
        },
        include: {
          tags: true, // เพื่อให้ได้ข้อมูล tagids กลับมาใน response
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

export default router;

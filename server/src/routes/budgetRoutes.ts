import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { requiresAuth } from "express-openid-connect";
import { prisma } from "../prisma";

const router = Router();
router.use(requiresAuth);

// Create a Budget
router.post("/budgets", async (req: Request, res: Response) => {
  const { amount, startDate, endDate, categoryId } = req.body;
  const userId = req.dbUser?.id;

  if (!amount || !startDate || !endDate || !userId) {
    return res
      .status(400)
      .json({
        error:
          "Amount, startDate, endDate are required and user must be authenticated.",
      });
  }

  try {
    const newBudget = await prisma.budget.create({
      data: {
        amount: new Prisma.Decimal(amount), // แปลงเป็น Prisma.Decimal
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
        categoryId,
      },
    });
    res.status(201).json(newBudget);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return res.status(409).json({ error: "Budget already exists." });
    }
    console.error("Error creating budget:", error?.message || error);
    res.status(500).json({ error: "Failed to create budget." });
  }
});

// Get Budgets by User ID
router.get("/users/:userId/budgets", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true, // ดึงข้อมูล category ที่เกี่ยวข้องด้วย
      },
      orderBy: {
        startDate: "desc",
      },
    });
    res.status(200).json(budgets);
  } catch (error) {
    console.error(
      "Error fetching budgets:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Failed to fetch budgets." });
  }
});

export default router;

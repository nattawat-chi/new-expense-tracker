import { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { requiresAuth } from "express-openid-connect";
import { prisma } from "../prisma";

const router = Router();

router.use(requiresAuth);

router.post("/accounts", async (req: Request, res: Response) => {
  const { name, balance, currency } = req.body;
  const userId = req.dbUser?.id;

  if (!name || !userId) {
    return res
      .status(400)
      .json({
        error: "Account name is required and user must be authenticated.",
      });
  }

  try {
    const newAccount = await prisma.account.create({
      data: {
        name,
        balance: new Prisma.Decimal(balance || 0), // แปลงเป็น Prisma.Decimal
        currency: currency || "THB",
        userId,
      },
    });
    res.status(201).json(newAccount);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return res
        .status(409)
        .json({ error: "Account name already exists for this user." });
    }
    console.error("Error creating account:", error?.message || error);
    res.status(500).json({ error: "Failed to create account." });
  }
});

// Get Accounts by User ID
router.get("/users/:userId/accounts", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        transactions: true, // ดึง transactions ที่เกี่ยวข้องกับ account นี้ด้วย
      },
    });
    res.status(200).json(accounts);
  } catch (error) {
    console.error(
      "Error fetching accounts:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Failed to fetch accounts." });
  }
});
export default router;

import { Router, Request, Response } from "express";
import { PrismaClient, TransactionType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

// ตัวอย่าง: ถ้าต้องการ auth ทุก endpoint
router.get(
  "/categories",
  requireAuth(),
  async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
  }
);

export default router;

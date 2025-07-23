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
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }
);
router.post(
  "/categories",
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { name, type } = req.body;
      const category = await prisma.category.create({
        data: { name, type },
      });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);

router.put(
  "/categories/:id",
  requireAuth(),

  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      const category = await prisma.category.update({
        where: { id: id },
        data: { name, type },
      });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);

export default router;

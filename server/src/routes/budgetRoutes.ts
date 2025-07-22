import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

router.get("/budgets", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const budgets = await prisma.budget.findMany({ where: { userId } });
  res.json(budgets);
});

export default router;

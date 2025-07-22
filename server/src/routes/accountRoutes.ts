import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

router.get("/accounts", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const accounts = await prisma.account.findMany({ where: { userId } });
  res.json(accounts);
});

export default router;

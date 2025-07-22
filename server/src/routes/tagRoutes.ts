import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

router.get("/tags", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const tags = await prisma.tag.findMany({ where: { userId } });
  res.json(tags);
});

export default router;

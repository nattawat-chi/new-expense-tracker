// import bcrypt from "bcryptjs";
import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requireAuth, getAuth } from "@clerk/express";

const router = Router();

// ตัวอย่าง route ที่ต้องการ auth
router.get("/users/me", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;

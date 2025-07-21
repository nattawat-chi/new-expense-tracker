import { User } from "@prisma/client";
import { prisma } from "../prisma";
import { Request, Response, NextFunction } from "express";

// Extend Express Request interface to include dbUser
declare global {
  namespace Express {
    interface Request {
      dbUser?: User;
    }
  }
}

export async function syncUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // ดึงข้อมูล user จาก Auth0 (req.oidc.user)
  console.log("Syncing user:", req.oidc.user);

  if (!req.oidc.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const { sub, email, name } = req.oidc.user;

  // เช็คว่ามี user นี้ใน database หรือยัง
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // ถ้ายังไม่มี ให้สร้างใหม่
    user = await prisma.user.create({
      data: {
        id: sub, // ใช้ Auth0 sub เป็น id (หรือจะใช้ field อื่นก็ได้)
        email,
        name,
        password: "", // Set a default password or generate one if needed
      },
    });
  }
  // แนบ user ใน req เพื่อใช้ใน route ต่อไป
  req.dbUser = user;
  next();
}

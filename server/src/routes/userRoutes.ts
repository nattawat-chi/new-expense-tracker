// import bcrypt from "bcryptjs";
import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requiresAuth } from "express-openid-connect";

const router = Router();
router.use(requiresAuth);

// Register User
// router.post("/register", async (req: Request, res: Response) => {
//   const { email, password, name } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required." });
//   }

//   try {
//     // Hash รหัสผ่าน
//     const hashedPassword = await bcrypt.hash(password, 10); // 10 คือ salt rounds

//     const newUser = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword, // บันทึกรหัสผ่านที่ Hash แล้ว
//         name,
//       },
//     });
//     // ไม่ควรส่ง hashedPassword กลับไปใน response
//     const { password: _, ...userWithoutPassword } = newUser;
//     res.status(201).json(userWithoutPassword);
//   } catch (error: any) {
//     if (error.code === "P2002" && error.meta?.target?.includes("email")) {
//       return res
//         .status(409)
//         .json({ error: "User with this email already exists." });
//     }
//     console.error("Error registering user:", error);
//     res.status(500).json({ error: "Failed to register user." });
//   }
// });

// Get all users (for testing, not recommended for production without auth)
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json(users);
    console.log("Fetched users:", users);
  } catch (error: any) {
    console.error(
      "Error fetching users:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

export default router;

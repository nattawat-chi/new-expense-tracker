import { Router, Request, Response } from "express";
import { PrismaClient, TransactionType } from "@prisma/client";
import { requiresAuth } from "express-openid-connect";
import { prisma } from "../prisma";

const router = Router();
router.use(requiresAuth);

// Create a Category
router.post("/categories", async (req: Request, res: Response) => {
  console.log("POST /categories called", req.body);
  const { name, type } = req.body;

  if (!name || !type) {
    return res
      .status(400)
      .json({ error: "Category name and type are required." });
  }

  // ตรวจสอบว่า type เป็นค่าที่ถูกต้องของ Enum หรือไม่
  if (!Object.values(TransactionType).includes(type.toUpperCase())) {
    return res.status(400).json({
      error: `Invalid category type. Must be ${Object.values(
        TransactionType
      ).join(", ")}.`,
    });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        type: type.toUpperCase() as TransactionType, // แปลงเป็น ENUM
      },
    });
    res.status(201).json(newCategory);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return res.status(409).json({ error: "Category name already exists." });
    }
    console.error("Error creating category:", error?.message || error);
    res.status(500).json({ error: "Failed to create category." });
  }
});

// Get all Categories
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

export default router;

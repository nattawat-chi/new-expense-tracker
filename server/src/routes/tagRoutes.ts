import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { requiresAuth } from "express-openid-connect";

const router = Router();
router.use(requiresAuth);

// Create a Tag
router.post("/tags", async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.dbUser?.id;

  if (!name || !userId) {
    return res
      .status(400)
      .json({ error: "Tag name is required and user must be authenticated." });
  }

  try {
    const newTag = await prisma.tag.create({
      data: {
        name,
        userId,
      },
    });
    res.status(201).json(newTag);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return res
        .status(409)
        .json({ error: "Tag name already exists for this user." });
    }
    console.error("Error creating tag:", error?.message || error);
    res.status(500).json({ error: "Failed to create tag." });
  }
});

// Get Tags by User ID
router.get("/users/:userId/tags", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
    });
    res.status(200).json(tags);
  } catch (error) {
    console.error(
      "Error fetching tags:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Failed to fetch tags." });
  }
});

export default router;

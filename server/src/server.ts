import express from "express";
import cors from "cors";
import { requireAuth, getAuth } from "@clerk/express";
import userRoutes from "./routes/userRoutes";
import accountRoutes from "./routes/accountRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import tagRoutes from "./routes/tagRoutes";
import { prisma } from "./prisma";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Clerk webhook endpoint for auto sync user
app.post("/api/clerk-webhook", async (req, res) => {
  const event = req.body;
  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const email = email_addresses?.[0]?.email_address || null;
    const firstName = first_name || null;
    const lastName = last_name || null;
    await prisma.user.upsert({
      where: { id },
      update: { email, firstName, lastName, imageUrl: image_url },
      create: {
        id,
        email,
        firstName,
        lastName,
        imageUrl: image_url,
        password: "",
      },
    });
  }
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("Hello from Personal Expense Tracker Backend (Clerk Auth)!");
});

// ตัวอย่าง route ที่ต้องการ auth
app.get("/transactions", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  // ดึงข้อมูล user จาก database local ด้วย userId
  res.json([]);
});

// Mount routes (ถ้าต้องการ auth ทุก route ให้ใส่ requireAuth() ในแต่ละไฟล์ route)
app.use(userRoutes);
app.use(accountRoutes);
app.use(categoryRoutes);
app.use(transactionRoutes);
app.use(budgetRoutes);
app.use(tagRoutes);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { requireAuth, getAuth } from "@clerk/express";
import userRoutes from "./routes/userRoutes";
import accountRoutes from "./routes/accountRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import tagRoutes from "./routes/tagRoutes";
import reportRoutes from "./routes/reportRoutes";
import { prisma } from "./prisma";

dotenv.config();

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

app.use(userRoutes);
app.use(accountRoutes);
app.use(categoryRoutes);
app.use(transactionRoutes);
app.use(budgetRoutes);
app.use(tagRoutes);
app.use(reportRoutes);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

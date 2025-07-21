import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import accountRoutes from "./routes/accountRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import tagRoutes from "./routes/tagRoutes";
import https from "https";
import fs from "fs";
import path from "path";
import cors from "cors";

import { auth0Middleware } from "./middleware/auth0";
import { syncUser } from "./middleware/syncUser";
import { requiresAuth } from "express-openid-connect";
import { prisma } from "./prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const sslOptions = {
  key: fs.readFileSync(
    path.resolve(__dirname, "../../certs/localhost+2-key.pem")
  ),
  cert: fs.readFileSync(path.resolve(__dirname, "../../certs/localhost+2.pem")),
};

app.use(auth0Middleware); // Middleware for Auth0 Authentication
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware to check if user is authenticated (public routes)
app.get("/", (req, res) => {
  // res.send("Hello from Personal Expense Tracker Backend (TypeScript)!");
  res.send(
    req.oidc.isAuthenticated()
      ? `Logged in <a href="/logout">Log out</a>`
      : `<a href="/login">Log in</a>`
  );
});

app.use(requiresAuth(), syncUser);

app.get("/profile", (req, res) => {
  res.send(`Hello ${req.dbUser?.name}, you are synced!`);
});

app.use(userRoutes); // 1. User Management
app.use(accountRoutes);
// 2. Account Management (ตัวอย่าง: สมมติว่ามี middleware สำหรับ Authentication และ Authorization แล้ว)
app.use(categoryRoutes); // 3. Category Management
app.use(transactionRoutes); // 4. Transaction Management
app.use(budgetRoutes); // 5. Budget Management
app.use(tagRoutes); // 6. Tag Management

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

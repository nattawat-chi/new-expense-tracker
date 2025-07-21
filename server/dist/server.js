"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello from Personal Expense Tracker Backend (TypeScript)!");
});
// 1. User Management
// Register User
app.post("/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    try {
        // Hash รหัสผ่าน
        const hashedPassword = await bcryptjs_1.default.hash(password, 10); // 10 คือ salt rounds
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword, // บันทึกรหัสผ่านที่ Hash แล้ว
                name,
            },
        });
        // ไม่ควรส่ง hashedPassword กลับไปใน response
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        if (error.code === "P2002" && error.meta?.target?.includes("email")) {
            return res
                .status(409)
                .json({ error: "User with this email already exists." });
        }
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Failed to register user." });
    }
});
// Get all users (for testing, not recommended for production without auth)
app.get("/users", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});
// 2. Account Management (ตัวอย่าง: สมมติว่ามี middleware สำหรับ Authentication และ Authorization แล้ว)
// Create an Account
app.post("/accounts", async (req, res) => {
    // ใน Production ควรมีการยืนยัน userId จาก token หรือ session
    const { name, balance, currency, userId } = req.body;
    if (!name || !userId) {
        return res
            .status(400)
            .json({ error: "Account name and userId are required." });
    }
    try {
        const newAccount = await prisma.account.create({
            data: {
                name,
                balance: new client_1.Prisma.Decimal(balance || 0), // แปลงเป็น Prisma.Decimal
                currency: currency || "THB",
                userId,
            },
        });
        res.status(201).json(newAccount);
    }
    catch (error) {
        if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            return res
                .status(409)
                .json({ error: "Account name already exists for this user." });
        }
        console.error("Error creating account:", error);
        res.status(500).json({ error: "Failed to create account." });
    }
});
// Get Accounts by User ID
app.get("/users/:userId/accounts", async (req, res) => {
    const { userId } = req.params;
    try {
        const accounts = await prisma.account.findMany({
            where: { userId },
            include: {
                transactions: true, // ดึง transactions ที่เกี่ยวข้องกับ account นี้ด้วย
            },
        });
        res.status(200).json(accounts);
    }
    catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ error: "Failed to fetch accounts." });
    }
});
// 3. Category Management
// Create a Category
app.post("/categories", async (req, res) => {
    const { name, type } = req.body;
    if (!name || !type) {
        return res
            .status(400)
            .json({ error: "Category name and type are required." });
    }
    // ตรวจสอบว่า type เป็นค่าที่ถูกต้องของ Enum หรือไม่
    if (!Object.values(client_1.TransactionType).includes(type.toUpperCase())) {
        return res.status(400).json({
            error: `Invalid category type. Must be ${Object.values(client_1.TransactionType).join(", ")}.`,
        });
    }
    try {
        const newCategory = await prisma.category.create({
            data: {
                name,
                type: type.toUpperCase(), // แปลงเป็น ENUM
            },
        });
        res.status(201).json(newCategory);
    }
    catch (error) {
        if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            return res.status(409).json({ error: "Category name already exists." });
        }
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Failed to create category." });
    }
});
// Get all Categories
app.get("/categories", async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories." });
    }
});
// 4. Transaction Management
// Create a Transaction (สำคัญ: การอัปเดต Budget และ Account Balance)
app.post("/transactions", async (req, res) => {
    const { amount, description, date, userId, accountId, categoryId, tagIds } = req.body;
    if (!amount || !userId || !accountId || !categoryId) {
        return res.status(400).json({
            error: "Amount, userId, accountId, and categoryId are required.",
        });
    }
    try {
        // 1. ดึง Category เพื่อตรวจสอบประเภท (type) และ TransactionType ที่ถูกต้อง
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        const transactionType = category.type; // ใช้ type จาก category
        // 2. สร้าง Transaction
        const newTransaction = await prisma.transaction.create({
            data: {
                amount: new client_1.Prisma.Decimal(amount), // แปลงเป็น Prisma.Decimal
                type: transactionType,
                description,
                date: date ? new Date(date) : new Date(), // ใช้ Date ที่ส่งมา หรือใช้ปัจจุบัน
                userId,
                accountId,
                categoryId,
                tags: {
                    create: tagIds ? tagIds.map((tagId) => ({ tagId })) : [], // สร้างความสัมพันธ์กับ Tag
                },
            },
            include: {
                tags: true, // เพื่อให้ได้ข้อมูล tagids กลับมาใน response
            },
        });
        // 3. อัปเดต Account Balance
        await prisma.account.update({
            where: { id: accountId },
            data: {
                balance: transactionType === client_1.TransactionType.INCOME
                    ? { increment: new client_1.Prisma.Decimal(amount) }
                    : { decrement: new client_1.Prisma.Decimal(amount) },
            },
        });
        // 4. อัปเดต Budget.spent (Logic ตัวอย่าง)
        const transactionDate = date ? new Date(date) : new Date();
        // ค้นหา Budget ที่เกี่ยวข้อง
        const relatedBudgets = await prisma.budget.findMany({
            where: {
                userId: userId,
                startDate: { lte: transactionDate }, // transactionDate อยู่หลังหรือตรงกับ startDate
                endDate: { gte: transactionDate }, // transactionDate อยู่ก่อนหรือตรงกับ endDate
                OR: [
                    { categoryId: categoryId }, // Budget สำหรับ Category นี้
                    { categoryId: null }, // หรือ Budget โดยรวม
                ],
            },
        });
        for (const budget of relatedBudgets) {
            // เราจะเพิ่มเข้า spent เสมอไม่ว่าจะเป็น Income หรือ Expense
            // เพราะ Budget คือการติดตามว่าใช้ไปเท่าไหร่ (รวมทั้ง Income ที่เข้ามาใน Budget)
            // หรือคุณอาจปรับ Logic นี้ให้เฉพาะ Expense เท่านั้น ขึ้นอยู่กับ Business Logic ของคุณ
            await prisma.budget.update({
                where: { id: budget.id },
                data: {
                    spent: {
                        increment: new client_1.Prisma.Decimal(amount),
                    },
                },
            });
        }
        res.status(201).json(newTransaction);
    }
    catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Failed to create transaction." });
    }
});
// Get Transactions by User ID
app.get("/users/:userId/transactions", async (req, res) => {
    const { userId } = req.params;
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            include: {
                account: true,
                category: true,
                tags: {
                    include: {
                        tag: true, // ดึงข้อมูล Tag จริงๆ ด้วย
                    },
                },
            },
            orderBy: {
                date: "desc", // เรียงตามวันที่ล่าสุดก่อน
            },
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions." });
    }
});
// 5. Budget Management
// Create a Budget
app.post("/budgets", async (req, res) => {
    const { amount, startDate, endDate, userId, categoryId } = req.body;
    if (!amount || !startDate || !endDate || !userId) {
        return res
            .status(400)
            .json({ error: "Amount, startDate, endDate, and userId are required." });
    }
    try {
        const newBudget = await prisma.budget.create({
            data: {
                amount: new client_1.Prisma.Decimal(amount), // แปลงเป็น Prisma.Decimal
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
                categoryId: categoryId || null, // ถ้าไม่มี categoryId ให้เป็น null
            },
        });
        res.status(201).json(newBudget);
    }
    catch (error) {
        console.error("Error creating budget:", error);
        res.status(500).json({ error: "Failed to create budget." });
    }
});
// Get Budgets by User ID
app.get("/users/:userId/budgets", async (req, res) => {
    const { userId } = req.params;
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId },
            include: {
                category: true, // ดึงข้อมูล category ที่เกี่ยวข้องด้วย
            },
            orderBy: {
                startDate: "desc",
            },
        });
        res.status(200).json(budgets);
    }
    catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ error: "Failed to fetch budgets." });
    }
});
// 6. Tag Management
// Create a Tag
app.post("/tags", async (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: "Tag name and userId are required." });
    }
    try {
        const newTag = await prisma.tag.create({
            data: {
                name,
                userId,
            },
        });
        res.status(201).json(newTag);
    }
    catch (error) {
        if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            return res
                .status(409)
                .json({ error: "Tag name already exists for this user." });
        }
        console.error("Error creating tag:", error);
        res.status(500).json({ error: "Failed to create tag." });
    }
});
// Get Tags by User ID
app.get("/users/:userId/tags", async (req, res) => {
    const { userId } = req.params;
    try {
        const tags = await prisma.tag.findMany({
            where: { userId },
            orderBy: {
                name: "asc",
            },
        });
        res.status(200).json(tags);
    }
    catch (error) {
        console.error("Error fetching tags:", error);
        res.status(500).json({ error: "Failed to fetch tags." });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

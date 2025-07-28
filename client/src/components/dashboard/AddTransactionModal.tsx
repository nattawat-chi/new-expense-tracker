"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { createTransaction } from "@/lib/api";
import { useGlobalStore } from "@/lib/store";

export function AddTransactionModal({
  onAdded,
  categories,
  catLoading,
  refetchCategories, // ไม่ใช้แล้ว แต่เก็บไว้เพื่อ backward compatibility
}: {
  onAdded?: () => void;
  categories: any[];
  catLoading: boolean;
  refetchCategories: () => void;
}) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    accountId: "",
    type: "EXPENSE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accounts, accountsLoading: accLoading } = useGlobalStore();

  // ลบ useEffect ที่เรียก refetchCategories ออก
  // categories จะถูกโหลดจาก initial load แล้ว

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      accountId: "",
      type: "EXPENSE",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          + Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!form.amount || !form.categoryId || !form.accountId) {
              setError("Please fill in the amount, category and account");
              return;
            }

            setLoading(true);
            try {
              const accessToken = await getToken();
              if (!accessToken) {
                setError("Cannot get access token");
                return;
              }

              const txData = {
                ...form,
                amount: Number(form.amount),
              };

              await createTransaction(txData, accessToken);

              // ปิด modal และ reset form
              setOpen(false);
              resetForm();
              setError(null);

              // เรียก callback
              onAdded?.();
            } catch (err: any) {
              setError(
                err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด"
              );
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <Select
            name="type"
            value={form.type}
            onValueChange={
              (value: string) =>
                setForm((f) => ({ ...f, type: value, categoryId: "" })) // reset categoryId เมื่อเปลี่ยน type
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>

          <Input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
            type="number"
            min="0"
            step="0.01"
          />

          <Input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
          />

          <Input
            name="date"
            value={form.date}
            onChange={handleChange}
            placeholder="Date"
            type="date"
            required
          />
          <Select
            name="categoryId"
            value={form.categoryId}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, categoryId: value }))
            }
            disabled={catLoading}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(categories) &&
                categories
                  .filter((cat: any) => cat.type === form.type)
                  .map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>

          <Select
            name="accountId"
            value={form.accountId}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, accountId: value }))
            }
            disabled={accLoading}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(accounts) &&
                accounts.map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Button,
  Dialog,
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
import { createTransaction, updateTransaction } from "@/lib/api";
import { useGlobalStore } from "@/lib/store";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
  onUpdated?: () => void;
  transaction?: any; // For editing
  categories?: any[];
}

export function TransactionModal({
  open,
  onOpenChange,
  onAdded,
  onUpdated,
  transaction,
  categories = [],
}: TransactionModalProps) {
  const { getToken } = useAuth();
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

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction && !transaction.isQuickAdd) {
        // Editing existing transaction
        setForm({
          amount: transaction.amount?.toString() || "",
          description: transaction.description || "",
          date: new Date(transaction.date).toISOString().split("T")[0],
          categoryId: transaction.categoryId || "",
          accountId: transaction.accountId || "",
          type: transaction.type || "EXPENSE",
        });
      } else if (transaction && transaction.isQuickAdd) {
        // Quick add transaction
        setForm({
          amount: transaction.amount?.toString() || "",
          description: transaction.description || "",
          date: new Date().toISOString().split("T")[0],
          categoryId: transaction.categoryId || "",
          accountId: "",
          type: "EXPENSE",
        });
      } else {
        // New transaction
        setForm({
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          categoryId: "",
          accountId: "",
          type: "EXPENSE",
        });
      }
      setError(null);
    }
  }, [open, transaction]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (transaction && !transaction.isQuickAdd) {
        // Update existing transaction
        await updateTransaction(transaction.id, txData, accessToken);
        onUpdated?.();
      } else {
        // Create new transaction
        await createTransaction(txData, accessToken);
        onAdded?.();
      }

      setLoading(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving transaction:", error);
      setError(error.response?.data?.error || "Error saving transaction");
      setLoading(false);
    }
  };

  const isEditing = transaction && !transaction.isQuickAdd;
  const title = isEditing ? "Edit Transaction" : "Add New Transaction";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

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
            type="text"
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
            name="type"
            value={form.type}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, type: value }))
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

          <Select
            name="categoryId"
            value={form.categoryId}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, categoryId: value }))
            }
            disabled={categories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories
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
            disabled={accLoading || accounts.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc: any) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

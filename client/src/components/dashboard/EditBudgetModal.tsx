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
import { createBudget, updateBudget } from "@/lib/api";

interface EditBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
  onUpdated?: () => void;
  editingBudget?: any;
  categories?: any[];
}

export function EditBudgetModal({
  open,
  onOpenChange,
  onAdded,
  onUpdated,
  editingBudget,
  categories = [],
}: EditBudgetModalProps) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or editingBudget changes
  useEffect(() => {
    if (open) {
      if (editingBudget && !editingBudget.isNew) {
        // Editing existing budget
        setForm({
          amount: editingBudget.amount?.toString() || "",
          startDate: new Date(editingBudget.startDate)
            .toISOString()
            .split("T")[0],
          endDate: new Date(editingBudget.endDate).toISOString().split("T")[0],
          categoryId: editingBudget.categoryId || "",
        });
      } else if (editingBudget && editingBudget.isNew) {
        // Creating new budget for specific category
        setForm({
          amount: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          )
            .toISOString()
            .split("T")[0],
          categoryId: editingBudget.categoryId || "",
        });
      } else {
        // Creating new budget
        setForm({
          amount: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
          )
            .toISOString()
            .split("T")[0],
          categoryId: "",
        });
      }
    }
  }, [open, editingBudget]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken = await getToken();
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const budgetData = {
        ...form,
        amount: Number(form.amount),
        categoryId: form.categoryId || undefined,
      };

      if (editingBudget && !editingBudget.isNew) {
        // Update existing budget
        await updateBudget(editingBudget.id, budgetData, accessToken);
        onUpdated?.();
      } else {
        // Create new budget
        await createBudget(budgetData, accessToken);
        onAdded?.();
      }

      setLoading(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving budget:", error);
      setLoading(false);
    }
  };

  const isEditing = editingBudget && !editingBudget.isNew;
  const title = isEditing ? "แก้ไขงบประมาณ" : "ตั้งงบประมาณใหม่";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            placeholder="Start Date"
            type="date"
            required
          />
          <Input
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            placeholder="End Date"
            type="date"
            required
          />
          <Select
            name="categoryId"
            value={form.categoryId}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, categoryId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category (Optional)" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((cat: any) => cat.type === "EXPENSE")
                .map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
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

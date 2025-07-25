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
import { createBudget } from "@/lib/api";
import { useGlobalStore } from "@/lib/store";

export function AddBudgetModal({ onAdded }: { onAdded?: () => void }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const { categories, categoriesLoading: catLoading } = useGlobalStore();

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          + ตั้งงบประมาณ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>ตั้งงบประมาณใหม่</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
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
            await createBudget(budgetData, accessToken);
            setLoading(false);
            setOpen(false);
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
            onAdded?.();
          }}
          className="space-y-4"
        >
          <Input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="จำนวนเงิน"
            required
            type="number"
            min="0"
            step="0.01"
          />
          <Input
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            placeholder="วันที่เริ่มต้น"
            type="date"
            required
          />
          <Input
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            placeholder="วันที่สิ้นสุด"
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
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกหมวดหมู่ (ไม่บังคับ)" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(categories) &&
                categories
                  .filter((cat: any) => cat.type === "EXPENSE")
                  .map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

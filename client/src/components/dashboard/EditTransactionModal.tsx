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
import { updateTransaction } from "@/lib/api";
import { useGlobalStore } from "@/lib/store";

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transaction: any;
  onSaved: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    categoryId: transaction?.category?.id || "",
    accountId: transaction?.account?.id || "",
    type: transaction?.type || "EXPENSE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    categories,
    categoriesLoading: catLoading,
    accounts,
    accountsLoading: accLoading,
  } = useGlobalStore();

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount?.toString() || "",
        description: transaction.description || "",
        date: transaction.date
          ? new Date(transaction.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        categoryId: transaction.category?.id || "",
        accountId: transaction.account?.id || "",
        type: transaction.type || "EXPENSE",
      });
    }
  }, [transaction]);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>แก้ไขรายการ</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!form.amount || !form.categoryId || !form.accountId) {
              setError("กรุณากรอกจำนวนเงิน เลือกหมวดหมู่ และบัญชีให้ครบถ้วน");
              return;
            }
            setLoading(true);
            const accessToken = await getToken();
            if (!accessToken) {
              setLoading(false);
              return;
            }
            const txData = {
              ...form,
              amount: Number(form.amount),
            };
            await updateTransaction(transaction.id, txData, accessToken);
            setLoading(false);
            onOpenChange(false);
            onSaved();
          }}
          className="space-y-4"
        >
          <Select
            name="type"
            value={form.type}
            onValueChange={(value: string) =>
              setForm((f) => ({ ...f, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">รายจ่าย</SelectItem>
              <SelectItem value="INCOME">รายรับ</SelectItem>
            </SelectContent>
          </Select>
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
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="คำอธิบาย"
          />
          <Input
            name="date"
            value={form.date}
            onChange={handleChange}
            placeholder="วันที่"
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
              <SelectValue placeholder="เลือกหมวดหมู่" />
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
              <SelectValue placeholder="เลือกบัญชี" />
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
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

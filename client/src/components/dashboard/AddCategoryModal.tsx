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
import { createCategory } from "@/lib/api";

export function AddCategoryModal({
  onAdded,
  categories,
  catLoading,
  refetchCategories,
}: {
  onAdded?: () => void;
  categories: any[];
  catLoading: boolean;
  refetchCategories: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "EXPENSE" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          + เพิ่มหมวดหมู่
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const accessToken = await getToken();
              if (!accessToken) {
                setError("No access token");
                setLoading(false);
                return;
              }
              await createCategory(form, accessToken);
              setOpen(false);
              setForm({ name: "", type: "EXPENSE" });
              onAdded?.();
            } catch (err: any) {
              setError(err?.message || "Error");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="ชื่อหมวดหมู่"
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
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">รายจ่าย</SelectItem>
              <SelectItem value="INCOME">รายรับ</SelectItem>
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

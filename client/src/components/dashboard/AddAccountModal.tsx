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
import { createAccount } from "@/lib/api";
import { useGlobalStore } from "@/lib/store";

export function AddAccountModal({ onAdded }: { onAdded?: () => void }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "BANK",
    bank: "",
    balance: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accounts, accountsLoading, fetchAccounts } = useGlobalStore();
  const bankList = [
    { value: "SCB", label: "SCB" },
    { value: "KTB", label: "KTB" },
    { value: "KBANK", label: "KBANK" },
    { value: "TMB", label: "TMB" },
    { value: "OTHER", label: "อื่นๆ" },
  ];

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleBankSelect = (bank: string) => {
    setForm((f) => ({
      ...f,
      bank,
      name: bank !== "OTHER" ? bank : "",
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-2 w-full md:w-auto cursor-pointer"
        >
          + เพิ่มบัญชีธนาคาร
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>เพิ่มบัญชีธนาคาร</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!form.name || !form.balance) {
              setError("กรุณากรอกชื่อบัญชีและยอดเงินเริ่มต้น");
              return;
            }
            setLoading(true);
            try {
              const accessToken = await getToken();
              if (!accessToken) {
                setError("No access token");
                setLoading(false);
                return;
              }
              if (accessToken) fetchAccounts(accessToken);
              await createAccount(
                {
                  name: form.name,
                  balance: Number(form.balance),
                  currency: "THB",
                },
                accessToken
              );
              setOpen(false);
              setForm({ name: "", type: "BANK", bank: "", balance: "" });
              onAdded?.();
            } catch (err: any) {
              setError(err?.message || "Error");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <Select
            name="bank"
            value={form.bank}
            onValueChange={handleBankSelect}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกธนาคาร" />
            </SelectTrigger>
            <SelectContent>
              {bankList.map((bank) => (
                <SelectItem key={bank.value} value={bank.value}>
                  {bank.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* If OTHER, show input for custom bank name */}
          {form.bank === "OTHER" && (
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ชื่อบัญชี/ธนาคาร (กำหนดเอง)"
              required
            />
          )}
          {/* If not OTHER, show input for account name (autofilled, but editable) */}
          {form.bank !== "OTHER" && (
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ชื่อบัญชี/ธนาคาร"
              required
            />
          )}
          <Input
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="ยอดเงินเริ่มต้น"
            required
            type="number"
            min="0"
            step="0.01"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

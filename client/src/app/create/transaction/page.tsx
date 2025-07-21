"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "",
    tag: "",
    account: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API
    alert("Transaction created! (mock)");
    onSuccess?.();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
      />
      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
      />
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        className="input input-bordered w-full"
      />
      <input
        name="tag"
        placeholder="Tag"
        value={form.tag}
        onChange={handleChange}
        className="input input-bordered w-full"
      />
      <input
        name="account"
        placeholder="Account"
        value={form.account}
        onChange={handleChange}
        className="input input-bordered w-full"
      />
      <Button type="submit" className="w-full">
        Create
      </Button>
    </form>
  );
}

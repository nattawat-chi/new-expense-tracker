"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TagForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({ name: "", color: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API
    alert("Tag created! (mock)");
    onSuccess?.();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
      />
      <input
        name="color"
        placeholder="Color"
        value={form.color}
        onChange={handleChange}
        className="input input-bordered w-full"
      />
      <Button type="submit" className="w-full">
        Create
      </Button>
    </form>
  );
}

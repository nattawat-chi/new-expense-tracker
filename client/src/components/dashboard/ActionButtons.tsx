"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Transaction } from "./types";

interface ActionButtonsProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export function ActionButtons({
  transaction,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDelete = () => {
    onDelete(transaction.id);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

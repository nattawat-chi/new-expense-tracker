"use client";

import { TransactionTable } from "./TransactionTable";
import type { Transaction } from "./types";

interface TransactionTableWrapperProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTableWrapper({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableWrapperProps) {
  return (
    <TransactionTable
      transactions={transactions}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

"use client";
import {
  Badge,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { Edit, Trash2 } from "lucide-react";
import type { Transaction } from "./types";

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx: Transaction) => (
          <TableRow key={tx.id}>
            <TableCell>
              {new Date(tx.date).toLocaleDateString("th-TH")}
            </TableCell>
            <TableCell>
              <Badge variant={tx.type === "INCOME" ? "success" : "destructive"}>
                {tx.type === "INCOME" ? "Income" : "Expense"}
              </Badge>
            </TableCell>
            <TableCell>{tx.category.name}</TableCell>
            <TableCell>{tx.description || "-"}</TableCell>
            <TableCell
              className={
                tx.type === "INCOME" ? "text-green-600" : "text-red-600"
              }
            >
              {tx.type === "INCOME" ? "+" : "-"}฿
              {Number(tx.amount).toLocaleString()}
            </TableCell>
            <TableCell>{tx.account.name}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(tx)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(tx.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

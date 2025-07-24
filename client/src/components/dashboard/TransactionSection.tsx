import { TransactionTable } from "./TransactionTable";
import { PaginationControls } from "./PaginationControls";
import type { Transaction, Pagination } from "./types";

export function TransactionSection({
  transactions,
  pagination,
  onEdit,
  onDelete,
  setCurrentPage,
}: {
  transactions: Transaction[];
  pagination: Pagination;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  setCurrentPage: (page: number) => void;
}) {
  return (
    <>
      <TransactionTable
        transactions={transactions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      {pagination && (
        <PaginationControls
          pagination={pagination}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
}

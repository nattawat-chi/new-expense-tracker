"use client";
import { Button } from "@/components/ui";
import type { Pagination } from "./types";

export function PaginationControls({
  pagination,
  setCurrentPage,
}: {
  pagination: Pagination;
  setCurrentPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} items
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => setCurrentPage(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.pages}
          onClick={() => setCurrentPage(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

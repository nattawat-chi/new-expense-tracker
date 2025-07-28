"use client";
import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from "@/components/ui";

export function DashboardFilterBar({
  filters,
  setFilters,
  categories,
}: {
  filters: any;
  setFilters: (f: any) => void;
  categories: any[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Input
        placeholder="Search by description..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      <Select
        value={filters.categoryId || "ALL"}
        onValueChange={(value) =>
          setFilters({
            ...filters,
            categoryId: value === "ALL" ? "" : value,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          {categories.map((cat: any) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.type || "ALL"}
        onValueChange={(value) =>
          setFilters({ ...filters, type: value === "ALL" ? "" : value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="EXPENSE">Expense</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        placeholder="Start Date"
      />
      <Input
        type="date"
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        placeholder="End Date"
      />
      <Button
        variant="outline"
        onClick={() => {
          setFilters({
            search: "",
            categoryId: "",
            accountId: "",
            type: "",
            startDate: "",
            endDate: "",
          });
        }}
      >
        Clear Filters
      </Button>
    </div>
  );
}

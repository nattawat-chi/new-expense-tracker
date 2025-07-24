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
        placeholder="ค้นหาจากคำอธิบาย..."
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
          <SelectValue placeholder="เลือกหมวดหมู่" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">ทุกหมวดหมู่</SelectItem>
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
          <SelectValue placeholder="เลือกประเภท" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">ทุกประเภท</SelectItem>
          <SelectItem value="INCOME">รายรับ</SelectItem>
          <SelectItem value="EXPENSE">รายจ่าย</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        placeholder="วันที่เริ่มต้น"
      />
      <Input
        type="date"
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        placeholder="วันที่สิ้นสุด"
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
        ล้างตัวกรอง
      </Button>
    </div>
  );
}

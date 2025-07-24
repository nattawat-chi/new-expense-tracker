import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export function SummaryCards({
  totalBalance,
  incomeTotal,
  expenseTotal,
}: {
  totalBalance: number;
  incomeTotal: number;
  expenseTotal: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ยอดเงินคงเหลือ</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ฿{totalBalance.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">รายรับเดือนนี้</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ฿{incomeTotal.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">รายจ่ายเดือนนี้</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            ฿{expenseTotal.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ยอดสุทธิ</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              incomeTotal - expenseTotal >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ฿{(incomeTotal - expenseTotal).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

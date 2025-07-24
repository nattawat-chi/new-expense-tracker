import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export function BudgetAlertsSection({ budgetAlerts }: { budgetAlerts: any[] }) {
  if (!budgetAlerts || budgetAlerts.length === 0) return null;
  return (
    <Card className="mb-8 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          แจ้งเตือนงบประมาณ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetAlerts.map((alert: any) => (
            <div
              key={alert.budget.id}
              className="p-4 bg-white rounded-lg border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">
                  {alert.budget.category?.name || "งบประมาณรวม"}
                </span>
                <Badge
                  variant={
                    alert.alertType === "OVER_BUDGET"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {alert.alertType === "OVER_BUDGET" ? "เกินงบ" : "ใกล้หมด"}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                ใช้ไปแล้ว {alert.percentageUsed.toFixed(1)}% ของงบประมาณ
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

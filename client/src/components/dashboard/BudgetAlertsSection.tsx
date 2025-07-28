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
          Budget Alerts
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
                  {alert.budget.category?.name || "Total Budget"}
                </span>
                <Badge
                  variant={
                    alert.alertType === "OVER_BUDGET"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {alert.alertType === "OVER_BUDGET"
                    ? "Over Budget"
                    : "Close to End"}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Used {alert.percentageUsed.toFixed(1)}% of the budget
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

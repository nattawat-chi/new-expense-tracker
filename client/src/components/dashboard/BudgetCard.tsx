import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Progress,
} from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export function BudgetCard({ budget }: { budget: any }) {
  const percentageUsed = budget.percentageUsed || 0;
  const isOverBudget = budget.isOverBudget;
  const isNearLimit = budget.isNearLimit;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{budget.category?.name || "งบประมาณรวม"}</span>
          {isOverBudget && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              เกินงบ
            </Badge>
          )}
          {isNearLimit && !isOverBudget && (
            <Badge variant="warning">
              <AlertTriangle className="h-3 w-3 mr-1" />
              ใกล้หมด
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>งบประมาณ:</span>
            <span className="font-semibold">
              ฿{Number(budget.amount).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>ใช้ไปแล้ว:</span>
            <span className="font-semibold">
              ฿{Number(budget.spent).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>เหลือ:</span>
            <span
              className={`font-semibold ${
                Number(budget.remaining) < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ฿{Number(budget.remaining).toLocaleString()}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>เปอร์เซ็นต์ที่ใช้:</span>
              <span className="font-semibold">
                {percentageUsed.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(percentageUsed, 100)}
              className={isOverBudget ? "bg-red-100" : ""}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(budget.startDate).toLocaleDateString("th-TH")} -{" "}
            {new Date(budget.endDate).toLocaleDateString("th-TH")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

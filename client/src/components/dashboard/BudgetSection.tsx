import { BudgetCard } from "./BudgetCard";
import { DashboardCharts } from "./DashboardCharts";
import { SummaryCards } from "./SummaryCards";

export function BudgetSection({
  budgets,
  totalBalance,
  incomeTotal,
  expenseTotal,
  pieChartData,
  barChartData,
}: {
  budgets: any[];
  totalBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  pieChartData: any;
  barChartData: any;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">งบประมาณ</h2>
      </div>
      <div>
        {budgets.map((budget: any) => (
          <div key={budget.id}>
            <div>
              <SummaryCards
                totalBalance={totalBalance}
                incomeTotal={incomeTotal}
                expenseTotal={expenseTotal}
              />
            </div>
            <div className="flex flex-row gap-6">
              <BudgetCard key={budget.id} budget={budget} />
              <DashboardCharts
                pieChartData={pieChartData}
                barChartData={barChartData}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

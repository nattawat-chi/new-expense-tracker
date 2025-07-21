import * as React from "react";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color?: string }>;

export function ChartContainer({
  children,
  config,
  className,
}: {
  children: React.ReactNode;
  config?: ChartConfig;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-xl p-4 shadow", className)}>
      {children}
    </div>
  );
}

export function ChartTooltip({ content }: { content: React.ReactNode }) {
  return content;
}

export function ChartTooltipContent() {
  // mockup tooltip content
  return (
    <div className="p-2 text-xs bg-white border rounded shadow">Tooltip</div>
  );
}

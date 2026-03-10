import * as React from "react";
import { Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

function ChartContainer({ className, children, config: _config, ...props }) {
  return (
    <div
      data-slot="chart-container"
      className={cn("w-full", className)}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const ChartTooltip = RechartsTooltip;

function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  formatter,
  labelFormatter,
}) {
  if (!active || !payload?.length) return null;

  const resolvedLabel = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <div className="min-w-[150px] rounded-lg border border-white/10 bg-[#0b1b29]/95 px-3 py-2 shadow-xl backdrop-blur">
      {resolvedLabel != null && (
        <div className="mb-1 text-xs font-medium text-slate-300">{resolvedLabel}</div>
      )}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {indicator === "dot" && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color || item.stroke || "#64748b" }}
                />
              )}
              <span className="text-xs text-slate-300">
                {formatter
                  ? formatter(item.value, item.name || item.dataKey, item)[1]
                  : item.name || item.dataKey}
              </span>
            </div>
            <span className="text-xs font-semibold text-white">
              {formatter
                ? formatter(item.value, item.name || item.dataKey, item)[0]
                : item.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };

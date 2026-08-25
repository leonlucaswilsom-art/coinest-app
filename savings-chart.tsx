import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatUSD, formatUSDCompact } from "@/lib/format";

const chartConfig = {
  saved: { label: "Total saved", color: "var(--chart-1)" },
} satisfies ChartConfig;

export interface SavingsChartPoint {
  date: string;
  total: number;
}

export function SavingsChart({ data }: { data: SavingsChartPoint[] }) {
  const hasData = data.length > 1;

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader>
        <div>
          <CardTitle className="text-base">Savings over time</CardTitle>
          <CardDescription>
            Your total nest egg grows with every entry you log
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <AreaChart data={data} margin={{ left: 2, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 8" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value) => formatUSDCompact(Number(value))}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-mono font-medium tabular-nums">
                        {formatUSD(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Area
                dataKey="total"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#savingsFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 text-center">
            <p className="text-sm font-medium text-foreground">
              {data.length === 0 ? "No savings yet" : "A curve is forming…"}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {data.length === 0
                ? "Log your first save and your growth curve will appear here."
                : "Log one more save and your growth curve will take shape."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

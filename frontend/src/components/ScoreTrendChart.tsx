import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Review } from "../types/api";
import { formatDate } from "../utils";

interface ScoreTrendChartProps {
  reviews: Review[];
}

export function ScoreTrendChart({ reviews }: ScoreTrendChartProps) {
  const points = [...reviews]
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .map((review) => ({
      date: formatDate(review.createdAt),
      score: review.score,
      title: review.prTitle,
    }));

  return (
    <section className="panel mt-xl p-lg">
      <p className="label-caps mb-lg">SCORE TREND</p>
      <div className="h-64 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={points} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-structure)" strokeDasharray="0" vertical={false} />
            <XAxis
              axisLine={{ stroke: "var(--color-structure)" }}
              dataKey="date"
              tick={{ fill: "var(--color-outline)", fontFamily: "JetBrains Mono", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={[1, 10]}
              tick={{ fill: "var(--color-outline)", fontFamily: "JetBrains Mono", fontSize: 11 }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-structure)",
                borderRadius: "0",
                color: "var(--color-primary)",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
              }}
              cursor={{ stroke: "var(--color-structure)" }}
            />
            <Line
              activeDot={{ fill: "var(--color-primary)", r: 4, strokeWidth: 0 }}
              dataKey="score"
              dot={{ fill: "var(--color-primary)", r: 3, strokeWidth: 0 }}
              stroke="var(--color-primary)"
              strokeWidth={2}
              type="linear"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

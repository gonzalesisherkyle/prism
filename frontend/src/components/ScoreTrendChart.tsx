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
    <section className="panel mt-xl p-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <p className="label-caps mb-lg">SCORE TREND</p>
      <div className="h-64 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={points} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(29, 44, 72, 0.4)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={{ stroke: "rgba(29, 44, 72, 0.6)" }}
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
                backgroundColor: "rgba(15, 28, 53, 0.95)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                color: "#f1f5f9",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
                backdropFilter: "blur(8px)",
              }}
              cursor={{ stroke: "rgba(99, 102, 241, 0.2)" }}
            />
            <Line
              activeDot={{ fill: "#ffffff", r: 6, stroke: "var(--color-primary)", strokeWidth: 3 }}
              dataKey="score"
              dot={{ fill: "var(--color-primary)", r: 4, strokeWidth: 0 }}
              stroke="url(#lineGrad)"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

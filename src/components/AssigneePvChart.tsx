// src/components/AssigneeLineChart.tsx
import type { LongData } from "evmtools-node/domain";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: LongData[];
};

type Point = { x: number; y: number };

type ChartRow = {
  baseDate: string;
  [key: string]: string | number;
};

// baseDateを"YYYY-MM-DD"形式に揃える関数
function formatDateToISO(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return d.toISOString().slice(0, 10);
}

function linearRegression(points: Point[]): { a: number; b: number } {
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { a: 0, b: 0 };

  const a = (n * sumXY - sumX * sumY) / denominator;
  const b = (sumY - a * sumX) / n;
  return { a, b };
}

function generateRegressionSeries(
  data: LongData[],
  assignee: string
): ChartRow[] {
  const filtered = data.filter((d) => d.assignee === assignee);
  if (filtered.length < 2) return [];

  const baseDate = new Date(formatDateToISO(filtered[0].baseDate));
  const points: Point[] = filtered
    .filter(
      (d): d is LongData & { value: number } => typeof d.value === "number"
    )
    .map((d) => ({
      x:
        (new Date(formatDateToISO(d.baseDate)).getTime() -
          baseDate.getTime()) /
        (1000 * 60 * 60 * 24),
      y: d.value,
    }));

  const { a, b } = linearRegression(points);

  return points.map((p) => {
    const date = new Date(baseDate.getTime() + p.x * 24 * 60 * 60 * 1000);
    return {
      baseDate: formatDateToISO(date),
      [`${assignee}_regression`]: a * p.x + b,
    };
  });
}

export const AssigneeLineChart = ({ data }: Props) => {
  const wideMap = new Map<string, Record<string, any>>();
  const regressionMap = new Map<string, Record<string, any>>();

  const assignees = Array.from(new Set(data.map((d) => d.assignee))).sort();

  // 実データ
  for (const { assignee, baseDate, value } of data) {
    const date = formatDateToISO(baseDate);
    if (!wideMap.has(date)) wideMap.set(date, { baseDate: date });
    wideMap.get(date)![assignee] = value;
  }

  // 回帰線データ
  for (const assignee of assignees) {
    const regSeries = generateRegressionSeries(data, assignee);
    for (const { baseDate, ...regData } of regSeries) {
      if (!regressionMap.has(baseDate))
        regressionMap.set(baseDate, { baseDate });
      Object.assign(regressionMap.get(baseDate)!, regData);
    }
  }

  // マージ
  const allDates = Array.from(
    new Set([
      ...Array.from(wideMap.keys()),
      ...Array.from(regressionMap.keys()),
    ])
  ).sort();

  const chartData = allDates
    .map((date) => ({
      ...(wideMap.get(date) || {}),
      ...(regressionMap.get(date) || {}),
      baseDate: date,
    }))
    .sort((a, b) => new Date(a.baseDate).getTime() - new Date(b.baseDate).getTime());

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="baseDate" />
        <YAxis />
        <Tooltip />
        <Legend />
        {assignees.map((assignee, index) => {
          const color = `hsl(${(index * 60) % 360}, 70%, 50%)`;
          return (
            <React.Fragment key={assignee}>
              <Line
                type="monotone"
                dataKey={assignee}
                stroke={color}
                dot={false}
                name={assignee}
              />
              <Line
                type="monotone"
                dataKey={`${assignee}_regression`}
                stroke={color}
                strokeDasharray="5 5"
                dot={false}
                name={`${assignee}（回帰線）`}
              />
            </React.Fragment>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

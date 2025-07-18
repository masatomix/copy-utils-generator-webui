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
  ReferenceLine,
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
): { rows: ChartRow[]; flatY: number; extendedY: number } {
  const filtered = data.filter((d) => d.assignee === assignee);
  if (filtered.length < 2) return { rows: [], flatY: 0, extendedY: 0 };

  const baseDate = new Date(formatDateToISO(filtered[0].baseDate));
  const points: Point[] = filtered
    .filter(
      (d): d is LongData & { value: number } => typeof d.value === "number"
    )
    .map((d) => ({
      x:
        (new Date(formatDateToISO(d.baseDate)).getTime() - baseDate.getTime()) /
        (1000 * 60 * 60 * 24),
      y: d.value,
    }));

  const { a, b } = linearRegression(points);
  const lastX = points[points.length - 1].x;
  const flatY = points[points.length - 1].y;
  const extendedY = a * lastX * 1.2 + b;
  const extendedX = a === 0 ? lastX + 7 : (extendedY - b) / a;

  const rows: ChartRow[] = [];

  for (let x = 0; x <= extendedX; x++) {
    const date = new Date(baseDate.getTime() + x * 24 * 60 * 60 * 1000);
    rows.push({
      baseDate: formatDateToISO(date),
      [`${assignee}_regression`]: a * x + b,
    });
  }

  return { rows, flatY, extendedY };
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
  const flatLines: { [key: string]: number } = {};
  const extendedFlatLines: { [key: string]: number } = {};

  for (const assignee of assignees) {
    const { rows, flatY, extendedY } = generateRegressionSeries(data, assignee);
    for (const { baseDate, ...regData } of rows) {
      if (!regressionMap.has(baseDate))
        regressionMap.set(baseDate, { baseDate });
      Object.assign(regressionMap.get(baseDate)!, regData);

      // 横線も生成
      regressionMap.get(baseDate)![`${assignee}_flat`] = flatY;
      regressionMap.get(baseDate)![`${assignee}_extended_flat`] = extendedY;
    }
    flatLines[assignee] = flatY;
    extendedFlatLines[assignee] = extendedY;
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
    .sort(
      (a, b) => new Date(a.baseDate).getTime() - new Date(b.baseDate).getTime()
    );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="baseDate" />
        <YAxis />
        <Tooltip />
        <Legend />

        {/* 〆切線（実線・茶色） */}
        <ReferenceLine
          x="2025-09-11"
          stroke="brown"
          strokeDasharray=""
          label={{
            value: "〆切",
            position: "top",
            fill: "brown",
            fontSize: 12,
          }}
        />
        {assignees.map((assignee, index) => {
          return (
            <React.Fragment key={assignee}>
              {/* 実データ線：オレンジ実線 */}
              <Line
                type="monotone"
                dataKey={assignee}
                stroke="#FFA500" // オレンジ
                dot={false}
                name={assignee}
              />
              {/* 回帰線：オレンジ破線 */}
              <Line
                type="monotone"
                dataKey={`${assignee}_regression`}
                stroke="#FFA500" // オレンジ
                strokeDasharray="5 5"
                dot={false}
                name={`${assignee}（回帰線）`}
              />
              {/* 実データ最終y横線：濃い緑実線 */}
              <Line
                type="linear"
                dataKey={`${assignee}_flat`}
                stroke="#006400" // 濃い緑
                dot={false}
                name={`${assignee}（最終値）`}
              />
              {/* 回帰線拡張最終y横線：濃い青実線 */}
              <Line
                type="linear"
                dataKey={`${assignee}_extended_flat`}
                stroke="#00008B" // 濃い青
                dot={false}
                name={`${assignee}（拡張最終値）`}
              />
            </React.Fragment>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

// src/components/AssigneeLineChart.tsx
import { dateStr } from "evmtools-node/common";
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

// baseDateを"YYYY/MM/DD"形式に揃える関数
function formatDateToISO(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return dateStr(d);
}

// 最小限の線形回帰（切片bなし）、傾きを返す
function linearRegression(points: Point[]): { a: number } {
  // const n = points.length;
  // const sumX = points.reduce((sum, p) => sum + p.x, 0);
  // const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = sumX2;
  if (denominator === 0) return { a: 0 };

  const a = sumXY / sumX2;
  return { a };
}

// 実データをMapに変換
function createActualDataMap(
  data: LongData[]
): Map<string, Record<string, any>> {
  const map = new Map<string, Record<string, any>>();
  for (const { assignee, baseDate, value } of data) {
    const date = formatDateToISO(baseDate);
    if (!map.has(date)) map.set(date, { baseDate: date });
    map.get(date)![assignee] = value;
  }
  return map;
}

// 回帰・横線データ作成
function createRegressionDataMap(
  data: LongData[],
  assignees: string[]
): {
  regressionMap: Map<string, Record<string, any>>; //回帰
  flatLines: Record<string, number>; //最終日横線
  extendedFlatLines: Record<string, number>; //バッファ横線
} {
  const map = new Map<string, Record<string, any>>();
  const flatLines: Record<string, number> = {};
  const extendedFlatLines: Record<string, number> = {};

  for (const assignee of assignees) {
    const filtered = data.filter(
      (d) => d.assignee === assignee && typeof d.value === "number"
    );
    if (filtered.length < 2) continue;

    const baseDate = new Date(formatDateToISO(filtered[0].baseDate));
    const points: Point[] = filtered.map((d) => ({
      x:
        (new Date(formatDateToISO(d.baseDate)).getTime() - baseDate.getTime()) /
        (1000 * 60 * 60 * 24),
      y: d.value as number,
    }));

    const { a } = linearRegression(points);
    const lastX = points[points.length - 1].x;
    const flatY = points[points.length - 1].y;

    // オリジナル最後のy値を1.2倍した値
    const extendedY = flatY * 1.2;

    // 傾きaが0でない場合、回帰線がextendedYに達するx値を計算して延長
    // a = y/x なので x = y/a
    const extendedX = a !== 0 ? Math.max(lastX, extendedY / a) : lastX + 7; // 傾き0なら適当に7日延長

    for (let x = 0; x <= extendedX; x++) {
      const date = new Date(baseDate.getTime() + x * 24 * 60 * 60 * 1000);
      const dateStr = formatDateToISO(date);
      if (!map.has(dateStr)) map.set(dateStr, { baseDate: dateStr });
      map.get(dateStr)![`${assignee}_regression`] = a * x;
      map.get(dateStr)![`${assignee}_flat`] = flatY;
      map.get(dateStr)![`${assignee}_extended_flat`] = extendedY;
    }

    flatLines[assignee] = flatY;
    extendedFlatLines[assignee] = extendedY;
  }

  return { regressionMap: map, flatLines, extendedFlatLines };
}

// マージ処理
function mergeChartData(
  actualMap: Map<string, Record<string, any>>,
  regressionMap: Map<string, Record<string, any>>
): ChartRow[] {
  const allDates = Array.from(
    new Set([...actualMap.keys(), ...regressionMap.keys()])
  ).sort();
  return allDates
    .map((date) => ({
      ...(actualMap.get(date) || {}),
      ...(regressionMap.get(date) || {}),
      baseDate: date,
    }))
    .sort(
      (a, b) => new Date(a.baseDate).getTime() - new Date(b.baseDate).getTime()
    );
}

// --- メイン描画コンポーネント ---
export const AssigneeLineChart = ({ data }: Props) => {
  // console.table(data)
  const assignees = Array.from(new Set(data.map((d) => d.assignee))).sort();
  const actualMap = createActualDataMap(data);
  const { regressionMap } = createRegressionDataMap(data, assignees);
  const chartData = mergeChartData(actualMap, regressionMap);

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

        {assignees.map((assignee) => (
          <React.Fragment key={assignee}>
            {/* 実データ線：オレンジ実線 */}
            <Line
              type="monotone"
              dataKey={assignee}
              stroke="#FFA500"
              dot={false}
              name={assignee}
            />
            {/* 回帰線：オレンジ破線 */}
            <Line
              type="monotone"
              dataKey={`${assignee}_regression`}
              stroke="#FFA500"
              strokeDasharray="5 5"
              dot={false}
              name={`${assignee}（回帰線）`}
            />
            {/* 実データ最終y横線：濃い緑実線 */}
            <Line
              type="linear"
              dataKey={`${assignee}_flat`}
              stroke="#006400"
              dot={false}
              name={`${assignee}（最終値）`}
            />
            {/* 回帰線拡張最終y横線：濃い青実線 */}
            <Line
              type="linear"
              dataKey={`${assignee}_extended_flat`}
              stroke="#00008B"
              dot={false}
              name={`${assignee}（拡張最終値）`}
            />
          </React.Fragment>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

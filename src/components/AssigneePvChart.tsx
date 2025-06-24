// src/components/AssigneeLineChart.tsx
import type { LongData } from "evmtools-node/domain";
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

export const AssigneeLineChart = ({ data }: Props) => {
  const wideMap = new Map<string, Record<string, any>>();
  for (const { assignee, baseDate, value } of data) {
    if (!wideMap.has(baseDate)) {
      wideMap.set(baseDate, { baseDate });
    }
    wideMap.get(baseDate)![assignee] = value;
  }
  const chartData = Array.from(wideMap.values());
  const assignees = Array.from(new Set(data.map((d) => d.assignee))).sort();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="baseDate" />
        <YAxis />
        <Tooltip />
        <Legend />
        {assignees.map((assignee, index) => (
          <Line
            key={assignee}
            type="monotone"
            dataKey={assignee}
            stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
            dot={false}
            name={assignee}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

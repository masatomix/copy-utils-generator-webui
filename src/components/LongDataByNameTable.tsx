// src/components/PvsLongTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import type { LongData } from "evmtools-node/domain";
import { formatDateWithWeekday } from "../utils/format";

type Props = {
  data: LongData[];
};

export const LongDataByNameTable = ({ data }: Props) => {
  // 1. 要員一覧（列ヘッダ）を一意に抽出
  const assignees = Array.from(new Set(data.map((d) => d.assignee))).sort();

  // 2. 日付一覧（行）を一意に抽出
  const dates = Array.from(new Set(data.map((d) => d.baseDate))).sort();

  // 3. 値のマッピング作成: Map<date, Map<assignee, value>>
  const valueMap: Map<string, Map<string, number>> = new Map();
  for (const { baseDate, assignee, value } of data) {
    if (!valueMap.has(baseDate)) valueMap.set(baseDate, new Map());
    valueMap.get(baseDate)!.set(assignee, value!);
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>日付</TableCell>
            {assignees.map((assignee) => (
              <TableCell key={assignee} align="right">
                {assignee}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dates.map((date) => (
            <TableRow
              key={date}
              sx={{
                backgroundColor: isToday(date)
                  ? "#fff8dc" // 今日: コーンシルク色
                  : isHoliday(date)
                  ? "#f0f0f0"
                  : "inherit", // 土日だけ薄いグレー
              }}
            >
              <TableCell>{formatDateWithWeekday(date)}</TableCell>
              {assignees.map((assignee) => {
                const value = valueMap.get(date)?.get(assignee);
                return (
                  <TableCell key={assignee} align="right">
                    {value !== undefined ? value : "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function isHoliday(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay(); // 0: 日, 6: 土
  return day === 0 || day === 6;
}

function isToday(dateString: string): boolean {
  const today = new Date();
  const target = new Date(dateString);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

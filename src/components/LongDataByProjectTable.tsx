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

type MergedRow = {
  baseDate: string;
  value1?: number;
  value2?: number;
};

type Props = {
  data: LongData[];
  label?: string; // デフォルト: "値"
  data2?: LongData[];
  label2?: string;
};

export const LongDataByProjectTable = ({
  data,
  label = "値",
  data2 = [],
  label2 = "",
}: Props) => {
  const mergedMap = new Map<string, MergedRow>();

  // data1/data2を日付で合体させる処理
  for (const d1 of data) {
    mergedMap.set(d1.baseDate, {
      baseDate: d1.baseDate,
      value1: d1.value,
    });
  }
  for (const d2 of data2) {
    if (mergedMap.has(d2.baseDate)) {
      mergedMap.get(d2.baseDate)!.value2 = d2.value;
    } else {
      mergedMap.set(d2.baseDate, {
        baseDate: d2.baseDate,
        value2: d2.value,
      });
    }
  }
  const result = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.baseDate).getTime() - new Date(b.baseDate).getTime()
  );
  // ココまで

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>日付</TableCell>
            <TableCell align="right">{label}</TableCell>
            <TableCell align="right">{label2}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.map((row, idx) => (
            <TableRow
              key={idx}
              sx={{
                backgroundColor: isHoliday(row.baseDate)
                  ? "#f0f0f0"
                  : "inherit", // 土日だけ薄いグレー
              }}
            >
              <TableCell>{formatDateWithWeekday(row.baseDate)}</TableCell>
              <TableCell align="right">{row.value1}</TableCell>
              <TableCell align="right">{row.value2}</TableCell>
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

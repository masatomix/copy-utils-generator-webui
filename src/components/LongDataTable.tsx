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

type Props = {
  data: LongData[];
  label?: string; // デフォルト: "値"
};

export const LongDataTable = ({ data, label = "値" }: Props) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>プロジェクト</TableCell>
            <TableCell>要員</TableCell>
            <TableCell>日付</TableCell>
            <TableCell align="right">{label}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.assignee}</TableCell>
              <TableCell>{row.assignee}</TableCell>
              <TableCell>{row.baseDate}</TableCell>
              <TableCell align="right">{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import type { AssigneeStatistics } from "evmtools-node/domain";

type Props = {
  data: AssigneeStatistics[];
};

export const AssigneeStatsTable = ({ data }: Props) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>assignee</TableCell>
            <TableCell align="right">全体タスク数</TableCell>
            <TableCell align="right">全体工数の和(Excel)</TableCell>
            <TableCell align="right">全体工数の和(計算)</TableCell>
            <TableCell align="right">全体工数平均</TableCell>
            <TableCell align="right">基準日</TableCell>
            <TableCell align="right">基準日終了時PV累積(Excel)</TableCell>
            <TableCell align="right">基準日終了時PV累積(計算)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.assignee}</TableCell>
              <TableCell align="right">{row.全体タスク数}</TableCell>
              <TableCell align="right">{row["全体工数の和(Excel)"]}</TableCell>
              <TableCell align="right">{row["全体工数の和(計算)"]}</TableCell>
              <TableCell align="right">{row.全体工数平均}</TableCell>
              <TableCell align="right">{row.基準日}</TableCell>
              <TableCell align="right">
                {row["基準日終了時PV累積(Excel)"]}
              </TableCell>
              <TableCell align="right">
                {row["基準日終了時PV累積(計算)"]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

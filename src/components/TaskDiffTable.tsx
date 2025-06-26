import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import type { TaskDiff } from "evmtools-node/domain";

export const TaskDiffTable = ({ data }: { data: TaskDiff[] }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>タスク名</TableCell>
        <TableCell>担当者</TableCell>
        <TableCell>進捗率Δ</TableCell>
        <TableCell>PVΔ</TableCell>
        <TableCell>EVΔ</TableCell>
        <TableCell>SPIΔ</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data
        // .filter((diff) => diff.hasDiff)
        .map((diff) => (
          <TableRow key={diff.id}>
            <TableCell>{diff.id}</TableCell>
            <TableCell>{diff.name}</TableCell>
            <TableCell>{diff.assignee}</TableCell>
            <TableCell>{diff.deltaProgressRate ?? "-"}</TableCell>
            <TableCell>{diff.deltaPV ?? "-"}</TableCell>
            <TableCell>{diff.deltaEV ?? "-"}</TableCell>
            <TableCell>{diff.deltaSPI ?? "-"}</TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
);

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
} from "@mui/material";
import { useState } from "react";
import type { TaskDiff } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";

type Order = "asc" | "desc";
type SortKey = keyof Pick<
  TaskDiff,
  | "id"
  | "name"
  | "assignee"
  | "deltaProgressRate"
  | "deltaPV"
  | "deltaEV"
  | "deltaSPI"
>;

export const TaskDiffTable = ({ data }: { data: TaskDiff[] }) => {
  const [orderBy, setOrderBy] = useState<SortKey>("assignee"); // ✅ デフォルトは assignee
  const [order, setOrder] = useState<Order>("asc");

  const handleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  const filtered = data.filter((d) => d.hasDiff); // ✅ 差分があるタスクのみ
  // const filtered = data;
  const sortedData = [...filtered].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return order === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {[
            { key: "id", label: "ID" },
            { key: "name", label: "タスク名" },
            { key: "assignee", label: "担当者" },
            { key: "deltaProgressRate", label: "進捗率Δ" },
            { key: "deltaPV", label: "PVΔ" },
            { key: "deltaEV", label: "EVΔ" },
            { key: "deltaSPI", label: "SPIΔ" },
          ].map(({ key, label }) => (
            <TableCell key={key}>
              <TableSortLabel
                active={orderBy === key}
                direction={orderBy === key ? order : "asc"}
                onClick={() => handleSort(key as SortKey)}
              >
                {label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedData.map((diff) => (
          <TableRow key={diff.id}>
            <TableCell>{diff.id}</TableCell>
            <TableCell>{diff.name}</TableCell>
            <TableCell>{diff.assignee}</TableCell>
            <TableCell>
              {formatNumberIntl(diff.deltaProgressRate, {
                maximumFractionDigits: 3,
              })}
            </TableCell>
            <TableCell>
              {formatNumberIntl(diff.deltaPV, {
                maximumFractionDigits: 3,
              })}
            </TableCell>
            <TableCell>
              {formatNumberIntl(diff.deltaEV, {
                maximumFractionDigits: 3,
              })}
            </TableCell>
            <TableCell>
              {formatNumberIntl(diff.deltaSPI, {
                maximumFractionDigits: 3,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

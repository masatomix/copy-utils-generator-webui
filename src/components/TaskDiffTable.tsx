import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { useState } from "react";
import type { TaskDiff } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";
import { HelpPopover } from "../pages/Evm";

type Order = "asc" | "desc";
type SortKey = keyof Pick<
  TaskDiff,
  | "id"
  | "name"
  | "assignee"
  | "deltaProgressRate"
  | "deltaPV"
  | "deltaEV"
  | "finished"
>;

export const TaskDiffTable = ({ data }: { data: TaskDiff[] }) => {
  const [orderBy, setOrderBy] = useState<SortKey>("assignee");
  const [order, setOrder] = useState<Order>("asc");
  const [showFullName, setShowFullName] = useState<boolean>(true);

  const handleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  const filtered = data.filter((d) => d.hasDiff);
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
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" gutterBottom>
            タスクの差分
          </Typography>
          <HelpPopover
            title="タスク差分"
            content={`現在のデータと前回のデータについて、ID同じタスクを比較し、その変化を表示しています。
              進捗率、PV、EVに変更があったタスクを表示。
              完了タスクはグレー表示。

2025/06/30時点: 消えたデータと、新規追加されたデータが表示されていないのでご注意。`}
          />
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => setShowFullName((prev) => !prev)}
        >
          {showFullName ? "タスク名省略表示" : "タスク名詳細表示"}
        </Button>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              { key: "id", label: "ID" },
              {
                key: showFullName ? "fullName" : "name",
                label: showFullName ? "タスク名（詳細）" : "タスク名（簡略）",
              },
              { key: "assignee", label: "担当者" },
              { key: "deltaProgressRate", label: "進捗率Δ" },
              { key: "deltaPV", label: "PVΔ" },
              { key: "deltaEV", label: "EVΔ" },
              { key: "finished", label: "完了" },
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
            <TableRow
              key={diff.id}
              sx={diff.finished ? { backgroundColor: "#f0f0f0" } : undefined}
            >
              <TableCell>{diff.id}</TableCell>
              <TableCell>{showFullName ? diff.fullName : diff.name}</TableCell>
              <TableCell>{diff.assignee}</TableCell>
              <TableCell>
                {formatNumberIntl(diff.deltaProgressRate, {
                  style: "percent",
                  maximumFractionDigits: 1,
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
              <TableCell>{diff.finished ? "完了" : "未完了"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

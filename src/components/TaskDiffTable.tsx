import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Button,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState } from "react";
import { Project, type DiffType, type TaskDiff } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";
import { HelpPopover } from "../pages/Evm";
import { ShowDiffTag } from "./ShowDiffTag";
import { dateStr } from "evmtools-node/common";

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
  | "diffType"
>;

export const TaskDiffTable = ({
  data,
  current,
  prev,
}: {
  data: TaskDiff[];
  current: Project;
  prev: Project;
}) => {
  const [orderBy, setOrderBy] = useState<SortKey>("assignee");
  const [order, setOrder] = useState<Order>("asc");
  const [showFullName, setShowFullName] = useState<boolean>(true);
  const [showActualValues, setShowActualValues] = useState<boolean>(false);
  const [filterOnlyDiff, setFilterOnlyDiff] = useState<boolean>(true);

  const handleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };
  
  const filtered = filterOnlyDiff ? data.filter((d) => d.hasDiff) : data;
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
              完了タスクはグレー表示。`}
          />
          (
          <Typography component="span" fontWeight="bold" color="primary">
            基準日: {dateStr(current.baseDate)}
          </Typography>
          ／
          <Typography component="span" fontWeight="bold" color="secondary">
            比較対象の基準日: {dateStr(prev.baseDate)}
          </Typography>
          ）
        </Stack>

        {/* ✅ ボタン群：右上に2ボタン */}
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowFullName((prev) => !prev)}
          >
            {showFullName ? "タスク名省略表示" : "タスク名詳細表示"}
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showActualValues}
                onChange={(e) => setShowActualValues(e.target.checked)}
              />
            }
            label="実数値も表示する"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filterOnlyDiff}
                onChange={(e) => setFilterOnlyDiff(e.target.checked)}
              />
            }
            label="差分のあるタスクのみ表示"
          />
        </Stack>
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
              { key: "deltaProgressRate", label: "進捗率差分" },
              { key: "deltaPV", label: "PV差分" },
              { key: "deltaEV", label: "EV差分" },
              { key: "finished", label: "完了" },
              { key: "diffType", label: "変更種別" },
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
                {formatPercentPoint(diff.deltaProgressRate)}
                <ShowDiffTag
                  current={diff.currentProgressRate}
                  prev={diff.prevProgressRate}
                  show={showActualValues}
                  style="percent"
                  maximumFractionDigits={1}
                />
              </TableCell>
              <TableCell>
                {formatNumberIntl(diff.deltaPV, { maximumFractionDigits: 3 })}
                <ShowDiffTag
                  current={diff.currentPV}
                  prev={diff.prevPV}
                  show={showActualValues}
                />
              </TableCell>
              <TableCell>
                {formatNumberIntl(diff.deltaEV, { maximumFractionDigits: 3 })}
                <ShowDiffTag
                  current={diff.currentEV}
                  prev={diff.prevEV}
                  show={showActualValues}
                />
              </TableCell>
              <TableCell>{diff.finished ? "完了" : "未完了"}</TableCell>
              <TableCell>{formatDiffType(diff.diffType)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

function formatPercentPoint(
  value: number | undefined | null,
  maximumFractionDigits = 1
): string | undefined {
  if (value == null) return "-";

  const formatted = formatNumberIntl(value * 100, {
    style: "decimal",
    maximumFractionDigits,
  });

  return `${formatted}pt`;
}

function formatDiffType(diffType: DiffType): string {
  switch (diffType) {
    case "modified":
      return "変更";
    case "added":
      return "追加";
    case "removed":
      return "削除";
    case "none":
      return "変化なし";
    default:
      return diffType;
  }
}

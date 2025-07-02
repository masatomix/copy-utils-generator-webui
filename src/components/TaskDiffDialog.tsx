import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import type { TaskDiff } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";
import { dateStr } from "evmtools-node/common";

export const TaskDiffDialog = ({
  open,
  onClose,
  selectedDiff,
}: {
  open: boolean;
  onClose: () => void;
  selectedDiff: TaskDiff | null;
}) => {
  if (!selectedDiff) return null;

  const { currentTask, prevTask } = selectedDiff;

  const rows: [
    string,
    string | number | null | undefined,
    string | number | null | undefined
  ][] = [
    ["ID", currentTask?.id, prevTask?.id],
    ["名称", currentTask?.name, prevTask?.name],
    ["担当者", currentTask?.assignee, prevTask?.assignee],
    [
      "予定工数",
      formatNumberIntl(currentTask?.workload, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.workload, { maximumFractionDigits: 3 }),
    ],
    [
      "一日あたり工数",
      formatNumberIntl(currentTask?.workloadPerDay, {
        maximumFractionDigits: 3,
      }),
      formatNumberIntl(prevTask?.workloadPerDay, { maximumFractionDigits: 3 }),
    ],
    [
      "予定開始日～終了日",
      `${dateStr(currentTask?.startDate)} ～ ${dateStr(currentTask?.endDate)}`,
      `${dateStr(prevTask?.startDate)} ～ ${dateStr(prevTask?.endDate)}`,
    ],
    [
      "実績開始日～終了日",
      `${dateStr(currentTask?.actualStartDate)} ～ ${dateStr(
        currentTask?.actualEndDate
      )}`,
      `${dateStr(prevTask?.actualStartDate)} ～ ${dateStr(
        prevTask?.actualEndDate
      )}`,
    ],
    [
      "進捗率",
      formatNumberIntl(currentTask?.progressRate, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
      formatNumberIntl(prevTask?.progressRate, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
    ],
    [
      "稼働予定日数",
      formatNumberIntl(currentTask?.scheduledWorkDays, {
        maximumFractionDigits: 0,
      }),
      formatNumberIntl(prevTask?.scheduledWorkDays, {
        maximumFractionDigits: 0,
      }),
    ],
    [
      "PV",
      formatNumberIntl(currentTask?.pv, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.pv, { maximumFractionDigits: 3 }),
    ],
    [
      "EV",
      formatNumberIntl(currentTask?.ev, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.ev, { maximumFractionDigits: 3 }),
    ],
    [
      "SPI",
      formatNumberIntl(currentTask?.spi, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.spi, { maximumFractionDigits: 3 }),
    ],
    [
      "予定進捗日",
      dateStr(currentTask?.expectedProgressDate),
      dateStr(prevTask?.expectedProgressDate),
    ],
    ["遅延日数", currentTask?.delayDays, prevTask?.delayDays],
    ["備考", currentTask?.remarks, prevTask?.remarks],
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>タスク詳細</DialogTitle>
      <DialogContent dividers>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>項目</TableCell>
              <TableCell>現在タスク</TableCell>
              <TableCell>前回タスク</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(([label, current, prev]) => (
              <TableRow key={label}>
                <TableCell>{label}</TableCell>
                <TableCell>{current ?? "-"}</TableCell>
                <TableCell>{prev ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

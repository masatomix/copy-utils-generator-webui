// components/TaskDiffDialog.tsx
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            {[
              [
                "ID",
                selectedDiff.currentTask?.id ?? "-",
                selectedDiff.prevTask?.id ?? "-",
              ],
              [
                "簡略名",
                selectedDiff.currentTask?.name ?? "-",
                selectedDiff.prevTask?.name ?? "-",
              ],
              [
                "担当者",
                selectedDiff.currentTask?.assignee ?? "-",
                selectedDiff.prevTask?.assignee ?? "-",
              ],

              [
                "予定工数",
                formatNumberIntl(selectedDiff.currentTask?.workload, {
                  maximumFractionDigits: 3,
                }) ?? "-",
                formatNumberIntl(selectedDiff.prevTask?.workload, {
                  maximumFractionDigits: 3,
                }) ?? "-",
              ],

              [
                "開始日",
                dateStr(selectedDiff.currentTask?.startDate),
                dateStr(selectedDiff.prevTask?.startDate),
              ],
              [
                "終了日",
                dateStr(selectedDiff.currentTask?.endDate),
                dateStr(selectedDiff.prevTask?.endDate),
              ],
              [
                "PV",
                formatNumberIntl(selectedDiff.currentTask?.pv, {
                  maximumFractionDigits: 3,
                }) ?? "-",
                formatNumberIntl(selectedDiff.prevTask?.pv, {
                  maximumFractionDigits: 3,
                }) ?? "-",
              ],
              [
                "EV",
                formatNumberIntl(selectedDiff.currentTask?.ev, {
                  maximumFractionDigits: 3,
                }) ?? "-",
                formatNumberIntl(selectedDiff.prevTask?.ev, {
                  maximumFractionDigits: 3,
                }) ?? "-",
              ],
              [
                "進捗率",
                formatNumberIntl(selectedDiff.currentTask?.progressRate, {
                  style: "percent",
                  maximumFractionDigits: 1,
                }),
                formatNumberIntl(selectedDiff.prevTask?.progressRate, {
                  style: "percent",
                  maximumFractionDigits: 1,
                }),
              ],
              [
                "遅延日数",
                selectedDiff.currentTask?.delayDays ?? "-",
                selectedDiff.prevTask?.delayDays ?? "-",
              ],
              [
                "備考",
                selectedDiff.currentTask?.remarks ?? "-",
                selectedDiff.prevTask?.remarks ?? "-",
              ],
            ].map(([label, current, prev]) => (
              <TableRow key={label as string}>
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

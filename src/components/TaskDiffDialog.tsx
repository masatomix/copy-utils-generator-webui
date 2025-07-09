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
import type { TaskDiff, TaskRow } from "evmtools-node/domain";
import {
  formatFinished,
  formatIsOverdueAt,
  formatNumberIntl,
} from "../utils/format";
import { dateStr, formatRelativeDays } from "evmtools-node/common";

export const TaskDiffDialog = ({
  open,
  onClose,
  selectedDiff,
  selectedIndex,
  onSelectIndex,
  diffListLength,
}: {
  open: boolean;
  onClose: () => void;
  selectedDiff: TaskDiff | null;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  diffListLength: number;
}) => {
  if (!selectedDiff) return null;

  const { currentTask, prevTask } = selectedDiff;

  const daysStrOverdueAt = (baseDate?: Date, taskRow?: TaskRow): string => {
    if (taskRow == null) return "-"; // taskRowがなければそもそも抜ける
    // 完了、未完了(期限切れ)、未完了(期限まだ)
    const isOverdueAtStr = formatIsOverdueAt(
      taskRow.isOverdueAt(baseDate!),
      taskRow.finished
    );

    const relativeDay = formatRelativeDays(baseDate, taskRow.endDate); // 日付を計算して文字列で返す
    const relativeDayStr = taskRow.finished
      ? "" // そもそも完了していたら、(データ基準日から終了日付がどれくらい過ぎているかだしても仕方がないので) 空文字で返す
      : relativeDay
      ? `(${relativeDay})`
      : ""; // データがあればカッコを付ける

    return isOverdueAtStr + relativeDayStr;
  };

  const fromToStrTmp = (startDate?: Date, endDate?: Date): string => {
    if (startDate == null && endDate == null) {
      return "-"; // taskRowがなければそもそも抜ける
    }
    return `${dateStr(startDate)} ～ ${dateStr(endDate)}`;
  };

  const fromToStrPV = (taskRow?: TaskRow): string =>
    !taskRow ? "-" : fromToStrTmp(taskRow.startDate, taskRow.endDate);

  const fromToStrEV = (taskRow?: TaskRow): string =>
    !taskRow
      ? "-"
      : fromToStrTmp(taskRow.actualStartDate, taskRow.actualEndDate);

  const rows: [
    string,
    string | number | null | undefined,
    string | number | null | undefined
  ][] = [
    ["ID", currentTask?.id, prevTask?.id],
    ["名称", currentTask?.name, prevTask?.name],
    ["担当者", currentTask?.assignee, prevTask?.assignee],
    [
      "予定工数(MD)",
      formatNumberIntl(currentTask?.workload, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.workload, { maximumFractionDigits: 3 }),
    ],
    [
      "稼働予定日数(日)",
      formatNumberIntl(currentTask?.scheduledWorkDays, {
        maximumFractionDigits: 0,
      }),
      formatNumberIntl(prevTask?.scheduledWorkDays, {
        maximumFractionDigits: 0,
      }),
    ],
    [
      "一日あたり工数(MD)",
      formatNumberIntl(currentTask?.workloadPerDay, {
        maximumFractionDigits: 3,
      }),
      formatNumberIntl(prevTask?.workloadPerDay, { maximumFractionDigits: 3 }),
    ],
    [
      "基準日",
      `${dateStr(selectedDiff.currentBaseDate)}`,
      `${dateStr(selectedDiff.prevBaseDate)}`,
    ],
    ["予定開始日～終了日", fromToStrPV(currentTask), fromToStrPV(prevTask)],
    ["実績開始日～終了日", fromToStrEV(currentTask), fromToStrEV(prevTask)],
    [
      "進捗率(%)",
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
      "PV(MD)",
      formatNumberIntl(currentTask?.pv, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.pv, { maximumFractionDigits: 3 }),
    ],
    [
      "EV(MD)",
      formatNumberIntl(currentTask?.ev, { maximumFractionDigits: 3 }),
      formatNumberIntl(prevTask?.ev, { maximumFractionDigits: 3 }),
    ],
    [
      "SPI (EV/PV)",
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
    [
      "未完了/完了",
      formatFinished(currentTask?.finished),
      formatFinished(prevTask?.finished),
    ],
    [
      "期限切れ?",
      daysStrOverdueAt(selectedDiff.currentBaseDate, currentTask),
      daysStrOverdueAt(selectedDiff.prevBaseDate, prevTask),
    ],
  ];

  // 前ボタンを押したら、親からもらった onSelectIndexをつかって1減らす
  const handlePrev = () => {
    if (selectedIndex > 0) {
      onSelectIndex(selectedIndex - 1);
    }
  };

  // 次ボタンを押したら、親からもらった onSelectIndexをつかって1増やす
  const handleNext = () => {
    if (selectedIndex < diffListLength - 1) {
      onSelectIndex(selectedIndex + 1);
    }
  };

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
            {rows.map(([label, current, prev]) => {
              // 背景色を定義
              const currentBgColor =
                currentTask && currentTask.finished
                  ? "#f0f0f0"
                  : currentTask?.isOverdueAt?.(selectedDiff.currentBaseDate!)
                  ? "#ffebee"
                  : undefined;

              const prevBgColor =
                prevTask && prevTask.finished
                  ? "#f0f0f0"
                  : prevTask?.isOverdueAt?.(selectedDiff.prevBaseDate!)
                  ? "#ffebee"
                  : undefined;

              return (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  <TableCell sx={{ backgroundColor: currentBgColor }}>
                    {current ?? "-"}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: prevBgColor }}>
                    {prev ?? "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        {" "}
        <Button onClick={handlePrev} disabled={selectedIndex === 0}>
          前の行
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedIndex >= diffListLength - 1}
        >
          次の行
        </Button>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

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
import type { Project, TaskRow } from "evmtools-node/domain";
import {
  formatFinished,
  formatIsOverdueAt,
  formatNumberIntl,
} from "../../utils/format";
import { dateStr, formatRelativeDays } from "evmtools-node/common";

export const TaskDetailDialog = ({
  open,
  onClose,
  selectedIndex,
  onSelectIndex,
  taskRows,
  baseDate,
  project,
}: {
  open: boolean;
  onClose: () => void;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  taskRows: TaskRow[];
  baseDate: Date;
  project: Project;
}) => {
  const currentTask = taskRows[selectedIndex];

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

  const rows: [string, string | number | null | undefined][] = [
    ["ID", currentTask?.id],
    ["名称", currentTask?.name],
    ["詳細名称", project.getFullTaskName(currentTask)],
    ["担当者", currentTask?.assignee],
    ["予定工数(MD)", currentTask?.workload],
    [
      "稼働予定日数(日)",
      formatNumberIntl(currentTask?.scheduledWorkDays, {
        maximumFractionDigits: 0,
      }),
    ],
    ["一日あたり工数(MD)", currentTask?.workloadPerDay],
    ["基準日", `${dateStr(baseDate)}`],
    ["予定開始日～終了日", fromToStrPV(currentTask)],
    ["実績開始日～終了日", fromToStrEV(currentTask)],
    [
      "進捗率(%)",
      formatNumberIntl(currentTask?.progressRate, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
    ],
    ["PV(MD)", currentTask?.calculatePVs(baseDate)],
    ["EV(MD)", currentTask?.ev],
    ["SPI (EV/PV)", currentTask?.calculateSPI(baseDate)],
    ["SV (EV-PV)", currentTask?.calculateSV(baseDate)],
    ["予定進捗日", dateStr(currentTask?.expectedProgressDate)],
    ["遅延日数", currentTask?.delayDays],
    ["備考", currentTask?.remarks],
    ["未完了/完了", formatFinished(currentTask?.finished)],
    ["期限切れ?", daysStrOverdueAt(baseDate, currentTask)],
  ];

  // 前ボタンを押したら、親からもらった onSelectIndexをつかって1減らす
  const handlePrev = () => {
    if (selectedIndex > 0) {
      onSelectIndex(selectedIndex - 1);
    }
  };

  // 次ボタンを押したら、親からもらった onSelectIndexをつかって1増やす
  const handleNext = () => {
    if (selectedIndex < taskRows.length - 1) {
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
              <TableCell sx={{ width: "180px", fontWeight: "bold" }}>
                項目
              </TableCell>
              <TableCell>タスク</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(([label, current]) => {
              const isBadSV =
                label === "SV (EV-PV)" &&
                typeof current === "number" &&
                current < 0;
              const isBadSPI =
                label === "SPI (EV/PV)" &&
                typeof current === "number" &&
                current < 1;

              // 背景色を定義
              const currentBgColor =
                currentTask && currentTask.finished
                  ? "#f0f0f0"
                  : currentTask?.isOverdueAt?.(baseDate)
                  ? "#ffebee"
                  : undefined;

              return (
                <TableRow key={label}>
                  <TableCell
                    sx={{
                      width: "180px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {label}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: currentBgColor,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      maxWidth: "600px",
                      color: isBadSV || isBadSPI ? "error.main" : "inherit",
                    }}
                  >
                    {typeof current === "number"
                      ? formatNumberIntl(current, { maximumFractionDigits: 3 })
                      : current ?? "-"}
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
          disabled={selectedIndex >= taskRows.length - 1}
        >
          次の行
        </Button>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

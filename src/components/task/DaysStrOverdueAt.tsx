import { TableCell } from "@mui/material";
import { formatRelativeDays } from "evmtools-node/common";
import { TaskRow } from "evmtools-node/domain";

export const DaysStrOverdueAt = ({
  taskRow,
  baseDate,
}: {
  taskRow: TaskRow;
  baseDate: Date;
}) => {
  const relativeDay = formatRelativeDays(baseDate, taskRow.endDate); // 日付を計算して文字列で返す
  const relativeDayStr = taskRow.finished
    ? "" // そもそも完了していたら、(データ基準日から終了日付がどれくらい過ぎているかだしても仕方がないので) 空文字で返す
    : relativeDay;
  return <TableCell>{relativeDayStr}</TableCell>;
};

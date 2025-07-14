import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { LongData, Project, TaskRow } from "evmtools-node/domain";
import { formatDateWithWeekday, formatNumberIntl } from "../utils/format";
import { useState } from "react";
import { dateStr } from "evmtools-node/common";

type Props = {
  data: LongData[];
  project: Project;
};

export const LongDataByNameTable = ({ data, project }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const [showFullTaskName, setShowFullTaskName] = useState(false);
  const toggleTaskNameDisplay = () => {
    setShowFullTaskName((prev) => !prev);
  };

  // 1. 要員一覧（列ヘッダ）を一意に抽出
  const assignees = Array.from(new Set(data.map((d) => d.assignee))).sort();

  // 2. 日付一覧（行）を一意に抽出
  const dates = Array.from(new Set(data.map((d) => d.baseDate))).sort();

  // 3. 値のマッピング作成: Map<date, Map<assignee, value>>
  const valueMap: Map<string, Map<string, number>> = new Map();
  for (const { baseDate, assignee, value } of data) {
    if (!valueMap.has(baseDate)) valueMap.set(baseDate, new Map());
    valueMap.get(baseDate)!.set(assignee, value!);
  }

  const handleCellClick = (date: string, assignee?: string) => {
    setSelectedDate(date);
    setSelectedAssignee(assignee);
    setDialogOpen(true);
    setShowFullTaskName(false)
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDate(undefined);
    setSelectedAssignee(undefined);
    setShowFullTaskName(false)
  };

  const taskRows: TaskRow[] = selectedDate
    ? project.getTaskRows(
        new Date(selectedDate),
        new Date(selectedDate),
        selectedAssignee
      )
    : [];

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              {assignees.map((assignee) => (
                <TableCell key={assignee} align="right">
                  {assignee}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dates.map((date) => (
              <TableRow
                key={date}
                sx={{
                  backgroundColor: isToday(date)
                    ? "#fff8dc" // 今日: コーンシルク色
                    : isHoliday(date)
                    ? "#f0f0f0"
                    : "inherit", // 土日だけ薄いグレー
                }}
              >
                <TableCell
                  onClick={() => {
                    handleCellClick(date);
                  }}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f5f5f5", // hover時に明るくする
                    },
                  }}
                >
                  {formatDateWithWeekday(date)}
                </TableCell>
                {assignees.map((assignee) => {
                  const value = valueMap.get(date)?.get(assignee);
                  const backgroundColor =
                    value === undefined
                      ? undefined
                      : value > 1.0
                      ? "#ffdddd"
                      : value < 0.8 && value !== 0
                      ? "#eef6ff"
                      : undefined;
                  return (
                    <TableCell
                      key={assignee}
                      align="right"
                      sx={{
                        backgroundColor,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: backgroundColor ?? "#f5f5f5", // hover時に明るくする
                        },
                      }}
                      onClick={() => {
                        handleCellClick(date, assignee);
                      }}
                    >
                      {value !== undefined ? value : "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => handleDialogClose()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div>
            {selectedDate ? (
              <>
                {`${formatDateWithWeekday(selectedDate)} の${
                  selectedAssignee ? ` ${selectedAssignee} の` : ""
                }タスク`}
                <Typography variant="caption" sx={{ display: "block" }}>
                  （「タスク名」をヘッダやデータのクリックで、詳細名に切り替えます）
                </Typography>
              </>
            ) : (
              "稼働情報"
            )}
          </div>
        </DialogTitle>
        <DialogContent dividers>
          {taskRows.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell
                    onClick={toggleTaskNameDisplay}
                    sx={{ cursor: "pointer", minWidth: 100 }}
                  >
                    タスク名
                  </TableCell>
                  <TableCell sx={{ minWidth: 30 }}>担当者</TableCell>
                  <TableCell>工数(MD)</TableCell>
                  <TableCell>日数(日)</TableCell>
                  <TableCell align="right">本日のPV</TableCell>
                  <TableCell>予定開始日</TableCell>
                  <TableCell>予定終了日</TableCell>
                  <TableCell>進捗率(%)</TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>
                    PV/EV/SPI
                  </TableCell>
                  {/* <TableCell align="right">未完了/完了</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {taskRows.map((task, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      backgroundColor: task.finished
                        ? "#f0f0f0"
                        : // : task.isOverdueAt(new Date(selectedDate!))
                          // ? "#ffebee"
                          undefined,
                    }}
                  >
                    <TableCell>{task.id}</TableCell>
                    <TableCell
                      onClick={toggleTaskNameDisplay}
                      sx={{ cursor: "pointer" }}
                    >
                      {showFullTaskName
                        ? project.getFullTaskName(task)
                        : task.name}
                    </TableCell>
                    <TableCell>{task.assignee}</TableCell>

                    <TableCell align="right">
                      {formatNumberIntl(task.workload, {
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumberIntl(task.scheduledWorkDays, {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>

                    <TableCell align="right">
                      {formatNumberIntl(
                        task.calculatePV(new Date(selectedDate!)),
                        { maximumFractionDigits: 3 }
                      )}
                    </TableCell>
                    <TableCell>{dateStr(task.startDate)}</TableCell>
                    <TableCell>{dateStr(task.endDate)}</TableCell>
                    <TableCell align="right">
                      {formatNumberIntl(task.progressRate, {
                        style: "percent",
                        maximumFractionDigits: 1,
                      })}
                    </TableCell>

                    <TableCell align="right">
                      {formatNumberIntl(task.pv, { maximumFractionDigits: 2 })}{" "}
                      /{" "}
                      {formatNumberIntl(task.ev, { maximumFractionDigits: 2 })}{" "}
                      /{" "}
                      {formatNumberIntl(task.spi, { maximumFractionDigits: 2 })}
                    </TableCell>

                    {/* <TableCell>{formatFinished(task.finished)}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>稼働タスクはありません。</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function isHoliday(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay(); // 0: 日, 6: 土
  return day === 0 || day === 6;
}

function isToday(dateString: string): boolean {
  const today = new Date();
  const target = new Date(dateString);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

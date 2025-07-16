import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import type { LongData, Project, TaskRow } from "evmtools-node/domain";
import { formatDateWithWeekday } from "../utils/format";
import { useState } from "react";
import { isToday } from "../utils/dateUtils";
import { isHoliday } from "evmtools-node/common";
import { TaskListDialog } from "./TaskListDialog";

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
    setShowFullTaskName(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDate(undefined);
    setSelectedAssignee(undefined);
    setShowFullTaskName(false);
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
                    : isHoliday(new Date(date), project)
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

      <TaskListDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        selectedDate={selectedDate}
        selectedAssignee={selectedAssignee}
        taskRows={taskRows}
        project={project}
        showFullTaskName={showFullTaskName}
        onToggleTaskNameDisplay={toggleTaskNameDisplay}
      />
    </>
  );
};

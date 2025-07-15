// src/components/PvsLongTable.tsx
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
import { TaskDialog } from "./TaskDialog";
import { isHoliday, isToday } from "../utils/dateUtils";

type MergedRow = {
  baseDate: string;
  value1?: number;
  value2?: number;
};

type Props = {
  data: LongData[];
  label?: string; // デフォルト: "値"
  data2?: LongData[];
  label2?: string;
  project: Project;
};

export const LongDataByProjectTable = ({
  data,
  label = "値",
  data2 = [],
  label2 = "",
  project,
}: Props) => {
  const mergedMap = new Map<string, MergedRow>();

  // data1/data2を日付で合体させる処理
  for (const d1 of data) {
    mergedMap.set(d1.baseDate, {
      baseDate: d1.baseDate,
      value1: d1.value,
    });
  }
  for (const d2 of data2) {
    if (mergedMap.has(d2.baseDate)) {
      mergedMap.get(d2.baseDate)!.value2 = d2.value;
    } else {
      mergedMap.set(d2.baseDate, {
        baseDate: d2.baseDate,
        value2: d2.value,
      });
    }
  }
  const result = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.baseDate).getTime() - new Date(b.baseDate).getTime()
  );
  // ココまで

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFullTaskName, setShowFullTaskName] = useState(false);
  const toggleTaskNameDisplay = () => {
    setShowFullTaskName((prev) => !prev);
  };

  const handleCellClick = (date: string) => {
    setSelectedDate(date);
    setDialogOpen(true);
    setShowFullTaskName(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDate(undefined);
    setShowFullTaskName(false);
  };

  const taskRows: TaskRow[] = selectedDate
    ? project.getTaskRows(new Date(selectedDate), new Date(selectedDate))
    : [];

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              <TableCell align="right">{label}</TableCell>
              <TableCell align="right">{label2}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor: isToday(row.baseDate)
                    ? "#fff8dc" // 今日: コーンシルク色
                    : isHoliday(row.baseDate)
                    ? "#f0f0f0"
                    : "inherit", // 土日だけ薄いグレー
                }}
              >
                <TableCell
                  onClick={() => {
                    handleCellClick(row.baseDate);
                  }}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f5f5f5", // hover時に明るくする
                    },
                  }}
                >
                  {formatDateWithWeekday(row.baseDate)}
                </TableCell>
                <TableCell align="right">{row.value1}</TableCell>
                <TableCell align="right">{row.value2}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TaskDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        selectedDate={selectedDate}
        selectedAssignee={undefined}
        taskRows={taskRows}
        project={project}
        showFullTaskName={showFullTaskName}
        onToggleTaskNameDisplay={toggleTaskNameDisplay}
      />
    </>
  );
};

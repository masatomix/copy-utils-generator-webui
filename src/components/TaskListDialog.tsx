import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { dateStr } from "evmtools-node/common";
import type { TaskRow, Project } from "evmtools-node/domain";
import {
  formatDateWithWeekday,
  formatFinished,
  formatNumberIntl,
} from "../utils/format";
import { useEffect, useMemo, useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import { DaysStrOverdueAt } from "./DaysStrOverdueAt";
import { TaskRowsFooter } from "./TaskRowsFooter";
import { PVEVSPI } from "./PVEVSPI";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedDate?: string;
  selectedAssignee?: string;
  taskRows: TaskRow[];
  project: Project;
  showFullTaskName: boolean;
  onToggleTaskNameDisplay: () => void;
};

export const TaskListDialog = ({
  open,
  onClose,
  selectedDate,
  selectedAssignee,
  taskRows,
  project,
  showFullTaskName,
  onToggleTaskNameDisplay,
}: Props) => {
  const [filterText, setFilterText] = useState<string>("");

  const filtered = useMemo(() => {
    if (!filterText.trim()) return taskRows;
    const keyword = filterText.toLowerCase();
    return taskRows.filter((d) => {
      return (
        d.name?.toLowerCase().includes(keyword) ||
        project.getFullTaskName(d).toLowerCase().includes(keyword) ||
        d.assignee?.toLowerCase().includes(keyword) ||
        String(d.id).includes(keyword) ||
        formatFinished(d.finished).toLowerCase() === keyword
      );
    });
  }, [project, taskRows, filterText]);

  useEffect(() => {
    if (!open) {
      setFilterText("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div>
          {selectedDate ? (
            <>
              {`${formatDateWithWeekday(selectedDate)} の${
                selectedAssignee ? ` ${selectedAssignee} の` : ""
              }タスク`}
              <Typography
                variant="caption"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Box>
                  （「タスク名」ヘッダのクリックで、詳細名に切り替わります）
                </Box>

                <Box ml={2}>
                  <Tooltip
                    title={
                      <span>
                        ・ID、タスク名、詳細タスク名、担当者名、の部分一致でフィルタできます。
                        <br />
                        ・完了区分(完了/未完了)もつかえます。
                      </span>
                    }
                    placement="top"
                  >
                    <TextField
                      size="small"
                      label="フィルタ"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      variant="outlined"
                      sx={{ minWidth: 200 }}
                      InputProps={{
                        endAdornment: filterText ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setFilterText("")}
                              aria-label="clear filter"
                              edge="end"
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Tooltip>
                </Box>
              </Typography>
            </>
          ) : (
            "稼働情報"
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {filtered.length > 0 ? (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell
                  onClick={onToggleTaskNameDisplay}
                  sx={{ cursor: "pointer", minWidth: 100 }}
                >
                  タスク名
                </TableCell>
                <TableCell sx={{ minWidth: 30 }}>担当者</TableCell>
                <TableCell>工数(MD)</TableCell>
                <TableCell>日数</TableCell>
                <TableCell align="right">本日のPV</TableCell>
                <TableCell>予定開始日</TableCell>
                <TableCell>予定終了日</TableCell>
                <TableCell>進捗率(%)</TableCell>
                <TableCell sx={{ minWidth: 45 }}>期限</TableCell>
                <Tooltip
                  title={
                    <span>
                      ・SV = EV - PV <br />
                      ・SPI = EV / PV <br />
                      EV - PV は、マイナス値は赤字表示
                    </span>
                  }
                  placement="top"
                >
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    累積
                    <br />
                    PV/EV/SPI/SV
                  </TableCell>
                </Tooltip>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((task) => (
                <TableRow
                  key={task.id}
                  sx={{
                    backgroundColor: task.finished
                      ? "#f0f0f0"
                      : // : task.isOverdueAt(new Date(selectedDate!))
                        // ? "#ffebee"
                        undefined,
                  }}
                >
                  <TableCell>{task.id}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={project.getFullTaskName(task)}
                      arrow
                      placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            fontSize: "1rem", // 通常よりやや大きめ（例: 16px）
                            maxWidth: 400, // 長い文字が折り返されすぎないように
                          },
                        },
                      }}
                    >
                      <span>
                        {showFullTaskName
                          ? project.getFullTaskName(task)
                          : task.name}
                      </span>
                    </Tooltip>
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
                  <DaysStrOverdueAt
                    taskRow={task}
                    baseDate={new Date(selectedDate!)}
                  ></DaysStrOverdueAt>
                  <PVEVSPI
                    taskRow={task}
                    baseDate={new Date(selectedDate!)}
                  ></PVEVSPI>
                </TableRow>
              ))}
            </TableBody>{" "}
            <TaskRowsFooter
              taskRows={filtered}
              baseDate={new Date(selectedDate!)}
            ></TaskRowsFooter>
          </Table>
        ) : (
          <p>稼働タスクはありません。</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

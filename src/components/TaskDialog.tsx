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
  TableFooter,
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

export const TaskDialog = ({
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

  const totals = useMemo(() => {
    const workload = filtered.reduce((sum, t) => sum + (t.workload ?? 0), 0);
    const pv = filtered.reduce((sum, t) => sum + (t.pv ?? 0), 0);
    const ev = filtered.reduce((sum, t) => sum + (t.ev ?? 0), 0);
    const spi = pv !== 0 ? ev / pv : NaN;
    const progressRate = workload !== 0 ? ev / workload : NaN;
    return {
      workload,
      pvToday: filtered.reduce(
        (sum, t) => sum + (t.calculatePV(new Date(selectedDate!)) ?? 0),
        0
      ),
      progressRate,
      pv,
      ev,
      spi,
    };
  }, [filtered, selectedDate]);

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
          <Table size="small">
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
                <TableCell align="right" sx={{ minWidth: 100 }}>
                  累積
                  <br />
                  PV/EV/SPI
                </TableCell>
                {/* <TableCell align="right">未完了/完了</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((task, idx) => (
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

                  <TableCell align="right">
                    {formatNumberIntl(task.pv, { maximumFractionDigits: 2 })} /{" "}
                    {formatNumberIntl(task.ev, { maximumFractionDigits: 2 })} /{" "}
                    {formatNumberIntl(task.spi, { maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* <TableCell>{formatFinished(task.finished)}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} align="right">
                  合計
                </TableCell>
                <TableCell align="right">
                  {formatNumberIntl(totals.workload, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right">
                  {formatNumberIntl(totals.pvToday, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
                <TableCell>
                  {formatNumberIntl(totals.progressRate, {
                    style: "percent",
                    maximumFractionDigits: 1,
                  })}
                </TableCell>
                <TableCell align="right">
                  {formatNumberIntl(totals.pv, { maximumFractionDigits: 2 })} /{" "}
                  {formatNumberIntl(totals.ev, { maximumFractionDigits: 2 })} /{" "}
                  {formatNumberIntl(totals.spi, { maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableFooter>
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

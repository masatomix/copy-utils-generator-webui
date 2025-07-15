import React, { useMemo, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
  TableContainer,
  Paper,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import type { Project, TaskRow } from "evmtools-node/domain";
import { dateStr } from "evmtools-node/common";
import { formatFinished, formatNumberIntl } from "../utils/format";

import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ReplayIcon from "@mui/icons-material/Replay"; // ← 追加

import SettingsIcon from "@mui/icons-material/Settings";
import { DaysStrOverdueAt } from "./DaysStrOverdueAt";
import { TaskRowsFooter } from "./TaskRowsFooter";
import { PVEVSPI } from "./PVEVSPI";
import { isHoliday } from "../utils/dateUtils";

type TaskRowsTableSetting = {
  onlyIncomplete: boolean;
  onlyTodayTask: boolean;
};

type TaskRowsSectionProps = {
  project: Project;
};

const TaskRowsSection: React.FC<TaskRowsSectionProps> = ({ project }) => {
  // 設定を状態管理
  const [taskRowsTableSetting, setTaskRowsTableSetting] =
    useState<TaskRowsTableSetting>({
      onlyIncomplete: false,
      onlyTodayTask: true,
    });
  const { onlyIncomplete, onlyTodayTask } = taskRowsTableSetting;

  const updateSetting = (key: keyof TaskRowsTableSetting) => {
    setTaskRowsTableSetting({
      ...taskRowsTableSetting,
      [key]: !taskRowsTableSetting[key],
    });
  };

  const [filterText, setFilterText] = useState<string>("");
  const [showFullTaskName, setShowFullTaskName] = useState(false);
  const toggleTaskNameDisplay = () => {
    setShowFullTaskName((prev) => !prev);
  };

  // 設定メニュー状態
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [baseDate, setBaseDate] = useState<Date>(project.baseDate);
  const changeBaseDate = (days: number) => {
    setBaseDate((prev) => {
      const newDate = new Date(prev);
      // 休日考慮(いま時点土日考慮のみ)
      while (true) {
        newDate.setDate(newDate.getDate() + (days > 0 ? 1 : -1));
        if (!isHoliday(newDate.toISOString(), project)) {
          break;
        }
      }
      return newDate;
    });
  };
  // const baseDate = project.baseDate;

  const filtered = useMemo(() => {
    // 今日タスクのみのばあいは検索機能、そうじゃない場合は子タスク全部
    const tmp: TaskRow[] = onlyTodayTask
      ? project.getTaskRows(baseDate)
      : project.toTaskRows().filter((d) => d.isLeaf);
    const taskRows = onlyIncomplete ? tmp.filter((d) => !d.finished) : tmp;

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
  }, [project, baseDate, filterText, onlyIncomplete, onlyTodayTask]);

  const isInitialDate =
    baseDate.toDateString() === project.baseDate.toDateString();

  return (
    <Box mt={4}>
      {/* 日付 + フィルタ + 歯車アイコン */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        {/* 日付情報 */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">
            <strong>基準日:</strong> {dateStr(baseDate)}{" "}
            <strong>(処理対象 {filtered.length} 件)</strong>
          </Typography>
        </Box>

        {/* フィルタ + 歯車 */}
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="前日へ">
            <IconButton
              onClick={() => changeBaseDate(-1)}
              sx={{
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#e0f2f1",
                },
              }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="翌日へ">
            <IconButton
              onClick={() => changeBaseDate(1)}
              sx={{
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* 🔄 リセットボタン */}
          <Tooltip title="初期日付にリセット">
            <IconButton
              onClick={() => setBaseDate(project.baseDate)}
              disabled={isInitialDate}
              sx={{
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#fff3e0",
                },
              }}
            >
              <ReplayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

          {/* 歯車ボタン */}
          <IconButton onClick={handleMenuOpen} size="small">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 説明行 */}
      <Typography variant="caption">
        （「タスク名」ヘッダのクリックで、詳細名に切り替わります）
      </Typography>

      {/* 設定メニュー */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => updateSetting("onlyIncomplete")}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={onlyIncomplete}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary="完了は非表示" />
        </MenuItem>
        <MenuItem onClick={() => updateSetting("onlyTodayTask")}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={onlyTodayTask}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary="基準日のタスクのみ表示" />
        </MenuItem>
      </Menu>

      {/* タスクテーブル */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 500, // ← 表の高さ上限
          overflow: "auto",
          mt: 2,
        }}
      >
        <Table size="small" stickyHeader>
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
              <TableCell>日数</TableCell>
              <TableCell align="right">本日のPV</TableCell>
              <TableCell>予定開始日</TableCell>
              <TableCell>予定終了日</TableCell>
              <TableCell>進捗率(%)</TableCell>
              <TableCell>期限切れまで</TableCell>
              <TableCell align="right" sx={{ minWidth: 100 }}>
                累積
                <br />
                PV/EV/SPI
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((task) => (
              <TableRow
                key={task.id}
                sx={{
                  backgroundColor: task.finished
                    ? "#f0f0f0"
                    : task.isOverdueAt(new Date(baseDate))
                    ? "#ffebee"
                    : undefined,
                }}
              >
                <TableCell>{task.id}</TableCell>
                <TableCell
                  sx={{
                    maxWidth: 300,
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
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
                  {formatNumberIntl(task.calculatePV(new Date(baseDate)), {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>{dateStr(task.startDate)}</TableCell>
                <TableCell>{dateStr(task.endDate)}</TableCell>
                <TableCell align="right">
                  {formatNumberIntl(task.progressRate, {
                    style: "percent",
                    maximumFractionDigits: 0,
                  })}
                </TableCell>
                <DaysStrOverdueAt
                  taskRow={task}
                  baseDate={baseDate}
                ></DaysStrOverdueAt>
                <PVEVSPI taskRow={task} baseDate={baseDate}></PVEVSPI>
              </TableRow>
            ))}
          </TableBody>
          <TaskRowsFooter
            taskRows={filtered}
            baseDate={baseDate}
          ></TaskRowsFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TaskRowsSection;

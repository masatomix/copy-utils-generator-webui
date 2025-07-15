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

import SettingsIcon from "@mui/icons-material/Settings";

type TaskRowsTableSetting = {
  onlyIncomplete: boolean;
};

type TaskRowsSectionProps = {
  project: Project;
};

const TaskRowsSection: React.FC<TaskRowsSectionProps> = ({ project }) => {
  // 設定を状態管理
  const [taskRowsTableSetting, setTaskRowsTableSetting] =
    useState<TaskRowsTableSetting>({
      onlyIncomplete: false,
    });
  const { onlyIncomplete } = taskRowsTableSetting;

  const updateSetting = (key: keyof TaskRowsTableSetting) => {
    setTaskRowsTableSetting({
      ...taskRowsTableSetting,
      [key]: !taskRowsTableSetting[key],
    });
  };

  const taskRows: TaskRow[] = project.toTaskRows();

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

  const filtered = useMemo(() => {
    // if (!filterText.trim()) return taskRows;
    const keyword = filterText.toLowerCase();
    return taskRows
      .filter((d) => {
        return (
          d.name?.toLowerCase().includes(keyword) ||
          project.getFullTaskName(d).toLowerCase().includes(keyword) ||
          d.assignee?.toLowerCase().includes(keyword) ||
          String(d.id).includes(keyword) ||
          formatFinished(d.finished).toLowerCase() === keyword
        );
      })
      .filter((d) => (onlyIncomplete ? !d.finished : true));
  }, [project, taskRows, filterText, onlyIncomplete]);

  const baseDate = project.baseDate;
  // 基準日
  return (
    <Box mt={4}>
      <Typography
        variant="caption"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Box>（「タスク名」ヘッダのクリックで、詳細名に切り替わります）</Box>
        

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
        </Menu>

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
          {/* 歯車ボタン */}
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 500, // ← 表の高さ上限
          overflow: "auto",
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
                    maximumFractionDigits: 3,
                  })}
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
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TaskRowsSection;

// ["ID", currentTask?.id, prevTask?.id],
// ["名称", currentTask?.name, prevTask?.name],
// [
//   "詳細名称",
//   current.getFullTaskName(currentTask),
//   prev.getFullTaskName(prevTask),
// ],
// ["担当者", currentTask?.assignee, prevTask?.assignee],
// [
//   "予定工数(MD)",
//   formatNumberIntl(currentTask?.workload, { maximumFractionDigits: 3 }),
//   formatNumberIntl(prevTask?.workload, { maximumFractionDigits: 3 }),
// ],
// [
//   "稼働予定日数(日)",
//   formatNumberIntl(currentTask?.scheduledWorkDays, {
//     maximumFractionDigits: 0,
//   }),
//   formatNumberIntl(prevTask?.scheduledWorkDays, {
//     maximumFractionDigits: 0,
//   }),
// ],
// [
//   "一日あたり工数(MD)",
//   formatNumberIntl(currentTask?.workloadPerDay, {
//     maximumFractionDigits: 3,
//   }),
//   formatNumberIntl(prevTask?.workloadPerDay, { maximumFractionDigits: 3 }),
// ],
// [
//   "基準日",
//   `${dateStr(selectedDiff.currentBaseDate)}`,
//   `${dateStr(selectedDiff.prevBaseDate)}`,
// ],
// ["予定開始日～終了日", fromToStrPV(currentTask), fromToStrPV(prevTask)],
// ["実績開始日～終了日", fromToStrEV(currentTask), fromToStrEV(prevTask)],
// [
//   "進捗率(%)",
//   formatNumberIntl(currentTask?.progressRate, {
//     style: "percent",
//     maximumFractionDigits: 1,
//   }),
//   formatNumberIntl(prevTask?.progressRate, {
//     style: "percent",
//     maximumFractionDigits: 1,
//   }),
// ],
// [
//   "PV(MD)",
//   formatNumberIntl(currentTask?.pv, { maximumFractionDigits: 3 }),
//   formatNumberIntl(prevTask?.pv, { maximumFractionDigits: 3 }),
// ],
// [
//   "EV(MD)",
//   formatNumberIntl(currentTask?.ev, { maximumFractionDigits: 3 }),
//   formatNumberIntl(prevTask?.ev, { maximumFractionDigits: 3 }),
// ],
// [
//   "SPI (EV/PV)",
//   formatNumberIntl(currentTask?.spi, { maximumFractionDigits: 3 }),
//   formatNumberIntl(prevTask?.spi, { maximumFractionDigits: 3 }),
// ],
// [
//   "予定進捗日",
//   dateStr(currentTask?.expectedProgressDate),
//   dateStr(prevTask?.expectedProgressDate),
// ],
// ["遅延日数", currentTask?.delayDays, prevTask?.delayDays],
// ["備考", currentTask?.remarks, prevTask?.remarks],
// [
//   "未完了/完了",
//   formatFinished(currentTask?.finished),
//   formatFinished(prevTask?.finished),
// ],
// [
//   "期限切れ?",
//   daysStrOverdueAt(selectedDiff.currentBaseDate, currentTask),
//   daysStrOverdueAt(selectedDiff.prevBaseDate, prevTask),
// ],

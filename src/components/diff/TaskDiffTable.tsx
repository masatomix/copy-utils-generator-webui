import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Typography,
  Stack,
  Divider,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TableContainer,
  Paper,
  Box,
  Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

import { useState } from "react";
import { Project, type TaskDiff } from "evmtools-node/domain";
import {
  formatDiffType,
  formatFinished,
  formatNumberIntl,
} from "../../utils/format";
import { ShowDiffTag } from "./ShowDiffTag";
import { dateStr } from "evmtools-node/common";
import { TaskDiffDialog } from "./TaskDiffDialog";
import type { TaskDiffTableSetting } from "./TaskDiffTabs";
import { TaskDiffFooter } from "./TaskDiffFooter";

type Order = "asc" | "desc";
type SortKey = keyof Pick<
  TaskDiff,
  | "id"
  | "name"
  | "assignee"
  | "deltaProgressRate"
  | "deltaPV"
  | "deltaEV"
  | "finished"
  | "diffType"
>;

export const TaskDiffTable = ({
  data,
  current,
  prev,
  setting,
  onSettingChange,
}: {
  data: TaskDiff[];
  current: Project;
  prev: Project;
  setting: TaskDiffTableSetting;
  onSettingChange: (newSetting: TaskDiffTableSetting) => void;
}) => {
  const { showFullName, showActualValues, filterOnlyDiff, alwaysShowOverdue } =
    setting;
  const updateSetting = (key: keyof TaskDiffTableSetting) => {
    onSettingChange({ ...setting, [key]: !setting[key] });
  };
  const [orderBy, setOrderBy] = useState<SortKey>("assignee");
  const [order, setOrder] = useState<Order>("asc");

  // const [showFullName, setShowFullName] = useState<boolean>(true);
  // const [showActualValues, setShowActualValues] = useState<boolean>(false);
  // const [filterOnlyDiff, setFilterOnlyDiff] = useState<boolean>(true);
  // const [alwaysShowOverdue, setAlwaysShowOverdue] = useState<boolean>(true);

  // 設定メニュー状態
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  // const filtered = filterOnlyDiff ? data.filter((d) => d.hasDiff) : data;
  // filterOnlyDiff が true でも、alwaysShowOverdue が true であれば isOverdueAt な行は表示されます。
  const filtered = data.filter((d) =>
    filterOnlyDiff ? d.hasDiff || (alwaysShowOverdue && d.isOverdueAt) : true
  );

  const sortedData = [...filtered].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return order === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const selectedDiff =
    selectedIndex >= 0 && selectedIndex < sortedData.length
      ? sortedData[selectedIndex]
      : null;

  // 行クリックで、indexとその行のデータをセットする
  const handleRowClick = (index: number) => {
    setSelectedIndex(index);
  };
  // 閉じるで、Indexと、選択データを初期化
  const handleDialogClose = () => {
    setSelectedIndex(-1);
  };

  return (
    <>
      {/* タイトルと設定 */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={() => updateSetting("showFullName")}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={showFullName}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary="タスク名詳細表示" />
          </MenuItem>
          <MenuItem onClick={() => updateSetting("showActualValues")}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={showActualValues}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary="実数値も表示" />
          </MenuItem>
          <MenuItem onClick={() => updateSetting("filterOnlyDiff")}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={filterOnlyDiff}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary="差分のあるタスクのみ表示" />
          </MenuItem>
          <MenuItem onClick={() => updateSetting("alwaysShowOverdue")}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={alwaysShowOverdue}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary="期限切れタスクは常に表示" />
          </MenuItem>
        </Menu>
      </Stack>
      <Stack spacing={1} mb={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <Typography variant="body2" mt={1}>
              進捗率、PV、EVに変更があったタスクを表示します。完了期限を過ぎたタスク(予定終了日
              ≤ 基準日)は変更がなくても赤背景で常に表示します。
            </Typography>
            <Typography variant="body2" mt={1}>
              右上の歯車で表示内容を制御したり、テキストフィルタリングも可能です。
            </Typography>
            <Typography variant="body2" mt={1}>
              ・ID、タスク名、担当者名、の部分一致でフィルタできます。
              <br />
              ・完了区分(完了/未完了)、変更種別（例:
              変更、追加）などもつかえます。
              <br />
              ・テキストボックスに「リスケ」と入力すると、PVにマイナス変動があったタスク(=リスケタスク)でフィルタされます。
            </Typography>
            <Typography variant="body2" mt={1}>
              行をクリックすると、新旧のデータの詳細が確認できます。
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>基準日:</strong> {dateStr(current.baseDate)} ／{" "}
              <strong>比較対象:</strong> {dateStr(prev.baseDate)}{" "}
              <strong>(処理対象 {filtered.length} 件)</strong>
            </Typography>
          </Stack>

          {/* 右上の設定ボタンとフィルタ */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* 歯車ボタン */}
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ alignSelf: "flex-start" }}
            >
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {/* 表本体（Paperで囲んでContainer） */}
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
              {[
                { key: "id", label: "ID" },
                {
                  key: showFullName ? "fullName" : "name",
                  label: showFullName ? "タスク名（詳細）" : "タスク名（簡略）",
                },
                { key: "assignee", label: "担当者" },
                { key: "deltaProgressRate", label: "進捗率差分" },
                { key: "deltaPV", label: "PV差分" },
                { key: "deltaEV", label: "EV差分" },
                { key: "finished", label: "完了" },
                { key: "diffType", label: "変更種別" },
                { key: "daysStrOverdueAt", label: "期限超過日数" },
              ].map(({ key, label }) => (
                <TableCell key={key}>
                  <TableSortLabel
                    active={orderBy === key}
                    direction={orderBy === key ? order : "asc"}
                    onClick={() => handleSort(key as SortKey)}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((diff, index) => (
              <TableRow
                key={diff.id}
                sx={{
                  backgroundColor: diff.finished
                    ? "#f0f0f0"
                    : diff.isOverdueAt
                    ? "#ffebee"
                    : undefined,
                  cursor: "pointer",
                }}
                onClick={() => handleRowClick(index)}
              >
                <TableCell>{diff.id}</TableCell>
                <TableCell
                  sx={{
                    maxWidth: 500,
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {!showFullName ? (
                    <Tooltip
                      title={diff.fullName}
                      arrow
                      placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            // fontSize: "1rem", // 通常よりやや大きめ（例: 16px）
                            maxWidth: 400, // 長い文字が折り返されすぎないように
                          },
                        },
                      }}
                    >
                      <Box component="span">{diff.name}</Box>
                    </Tooltip>
                  ) : (
                    diff.fullName
                  )}
                </TableCell>

                <Tooltip
                  title={`工数: ${diff.workload ?? "-"}`}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        // fontSize: "1rem", // 通常よりやや大きめ（例: 16px）
                        maxWidth: 400, // 長い文字が折り返されすぎないように
                      },
                    },
                  }}
                >
                  <TableCell>{diff.assignee}</TableCell>
                </Tooltip>
                <TableCell
                  sx={{
                    fontWeight: diff.hasProgressRateDiff ? "bold" : "normal",
                    color: diff.hasProgressRateDiff
                      ? "inherit"
                      : "text.secondary",
                  }}
                >
                  {formatPercentPoint(diff.deltaProgressRate)}
                  <ShowDiffTag
                    current={diff.currentProgressRate}
                    prev={diff.prevProgressRate}
                    show={showActualValues}
                    style="percent"
                    maximumFractionDigits={1}
                  />
                </TableCell>
                <Tooltip
                  title={
                    <>
                      マイナス値は太字の赤で表示
                      <br />
                      (リスケタスクの可能性があるため)
                    </>
                  }
                  placement="top"
                >
                  <TableCell
                    sx={{
                      fontWeight: diff.hasPvDiff ? "bold" : "normal",
                      color: diff.hasPvDiff ? "inherit" : "text.secondary",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: diff.deltaPV! < 0 ? "error.main" : "inherit",
                      }}
                    >
                      {formatNumberIntl(diff.deltaPV, {
                        maximumFractionDigits: 3,
                      })}
                    </Box>
                    <ShowDiffTag
                      current={diff.currentPV}
                      prev={diff.prevPV}
                      show={showActualValues}
                    />
                  </TableCell>
                </Tooltip>
                <TableCell
                  sx={{
                    fontWeight: diff.hasEvDiff ? "bold" : "normal",
                    color: diff.hasEvDiff ? "inherit" : "text.secondary",
                  }}
                >
                  {formatNumberIntl(diff.deltaEV, { maximumFractionDigits: 3 })}
                  <ShowDiffTag
                    current={diff.currentEV}
                    prev={diff.prevEV}
                    show={showActualValues}
                  />
                </TableCell>
                <TableCell>{formatFinished(diff.finished)}</TableCell>
                <TableCell>{formatDiffType(diff.diffType)}</TableCell>
                <TableCell>
                  {!diff.finished ? diff.daysStrOverdueAt : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TaskDiffFooter
            filtered={filtered}
            showActualValues={showActualValues}
          ></TaskDiffFooter>
        </Table>
      </TableContainer>

      {/* ダイアログ */}
      <TaskDiffDialog
        open={!!selectedDiff}
        onClose={handleDialogClose}
        selectedDiff={selectedDiff}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        diffListLength={sortedData.length}
        current={current}
        prev={prev}
      />
    </>
  );
};

function formatPercentPoint(
  value: number | undefined | null,
  maximumFractionDigits = 1
): string | undefined {
  if (value == null) return "-";
  const formatted = formatNumberIntl(value * 100, {
    style: "decimal",
    maximumFractionDigits,
  });
  return `${formatted}pt`;
}

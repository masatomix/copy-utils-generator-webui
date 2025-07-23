import { useMemo, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Project, type TaskDiff } from "evmtools-node/domain";
import { TaskDiffTable } from "./TaskDiffTable";
import { AssigneeDiffTable } from "./AssigneeDiffTable";
import { ProjectDiffSummary } from "./ProjectDiffSummary";
import ClearIcon from "@mui/icons-material/Clear";
import { formatDiffType, formatFinished } from "../../utils/format";

type Props = {
  data: TaskDiff[];
  current: Project;
  prev: Project;
};

export type TaskDiffTableSetting = {
  showFullName: boolean;
  showActualValues: boolean;
  filterOnlyDiff: boolean;
  alwaysShowOverdue: boolean;
};

export const TaskDiffTabs = ({ data, current, prev }: Props) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [taskDiffSetting, setTaskDiffSetting] = useState<TaskDiffTableSetting>({
    showFullName: true,
    showActualValues: false,
    filterOnlyDiff: true,
    alwaysShowOverdue: true,
  });

  const [filterText, setFilterText] = useState<string>("");

  // const filtered = filterOnlyDiff ? data.filter((d) => d.hasDiff) : data;

  const filtered = useMemo(() => {
    if (!filterText) return data;
    const keyword = filterText.toLowerCase();
    return data.filter((d) => {
      return (
        d.name?.toLowerCase().includes(keyword) ||
        d.fullName?.toLowerCase().includes(keyword) ||
        d.assignee?.toLowerCase().includes(keyword) ||
        // (!isNaN(Number(filterText)) && d.id === Number(filterText))
        String(d.id).includes(keyword) ||
        formatDiffType(d.diffType).toLowerCase() === keyword ||
        formatFinished(d.finished).toLowerCase() === keyword
      );
    });
  }, [data, filterText]);

  return (
    <Box>
      {/* タブとフィルタを横並びに配置 */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)}>
          <Tab label="個別タスク" />
          <Tab label="担当ごと" />
          <Tab label="プロジェクト単位" />
        </Tabs>

        <Tooltip
          title={
            <span>
              ・ID、タスク名、担当者名、の部分一致でフィルタできます。
              <br />
              ・完了区分(完了/未完了)、変更種別（例:
              変更、追加）などもつかえます。
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

      {tabIndex === 0 && (
        <TaskDiffTable
          data={filtered}
          current={current}
          prev={prev}
          setting={taskDiffSetting}
          onSettingChange={setTaskDiffSetting}
        />
      )}
      {tabIndex === 1 && (
        <AssigneeDiffTable data={filtered} current={current} prev={prev} />
      )}
      {tabIndex === 2 && (
        <ProjectDiffSummary data={filtered} current={current} prev={prev} />
      )}
    </Box>
  );
};

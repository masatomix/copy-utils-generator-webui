import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { Project, type TaskDiff } from "evmtools-node/domain";
import { TaskDiffTable } from "./TaskDiffTable";
import { AssigneeDiffTable } from "./AssigneeDiffTable";
import { ProjectDiffSummary } from "./ProjectDiffSummary";

type Props = {
  data: TaskDiff[];
  current: Project;
  prev: Project;
};

export const TaskDiffTabs = ({ data, current, prev }: Props) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(_, idx) => setTabIndex(idx)}
        sx={{ mb: 2 }}
      >
        <Tab label="個別タスク" />
        <Tab label="担当ごと" />
        <Tab label="プロジェクト単位" />
      </Tabs>

      {tabIndex === 0 && (
        <TaskDiffTable data={data} current={current} prev={prev} />
      )}
      {tabIndex === 1 && (
        <AssigneeDiffTable data={data} current={current} prev={prev} />
      )}
      {tabIndex === 2 && (
        <ProjectDiffSummary data={data} current={current} prev={prev} />
      )}
    </Box>
  );
};

// src/components/AssigneeView.tsx
import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import type { ProjectStatistics } from "evmtools-node/domain";
import { ProjectStatsTable } from "./ProjectStatsTable";

type Props = {
  data: ProjectStatistics[];
  initialTab?: number;
};

export const ProjectStatsView = ({ data, initialTab = 0 }: Props) => {
  const [tabIndex, setTabIndex] = useState(initialTab);

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        sx={{
          minHeight: 32,
          "& .MuiTab-root": {
            minHeight: 32,
            paddingY: 0.5,
            paddingX: 1.5,
            fontSize: 14,
            textTransform: "none",
          },
          "& .MuiTabs-indicator": {
            height: 2,
          },
        }}
      >
        <Tab label="メイン" />
        <Tab label="詳細" />
      </Tabs>
      <Box mt={2}>
        {tabIndex === 0 && <ProjectStatsTable data={data} />}
        {tabIndex === 1 && <ProjectStatsTable data={data} detail={true} />}
      </Box>
    </Box>
  );
};

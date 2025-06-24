// src/components/AssigneeView.tsx
import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import type { LongData } from "evmtools-node/domain";
import { AssigneeLineChart } from "./AssigneePvChart";
import { LongDataTable } from "./LongDataTable";

type Props = {
  tableData: LongData[];
  chartData: LongData[];
  label: string;
};

export const AssigneeView = ({ tableData, chartData, label }: Props) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box>
      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
        <Tab label="PVグラフ" />
        <Tab label="日ごとの素データ" />
      </Tabs>

      <Box mt={2}>
        {tabIndex === 0 && <AssigneeLineChart data={chartData} label={label} />}
        {tabIndex === 1 && <LongDataTable data={tableData} />}
      </Box>
    </Box>
  );
};

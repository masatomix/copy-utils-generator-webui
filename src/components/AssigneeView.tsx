// src/components/AssigneeView.tsx
import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import type { LongData } from "evmtools-node/domain";
import { AssigneeLineChart } from "./AssigneePvChart";

type Props = {
  tableData: LongData[];
  chartData: LongData[];
  label: string;
  tableData2?: LongData[];
  label2?: string;
  initialTab?: number;
  TableComponent: React.ComponentType<{
    // TableComponentのプロパティはココで指定。
    data: LongData[];
    label?: string;
    data2?: LongData[];
    label2?: string;
  }>;
};

export const AssigneeView = ({
  tableData,
  chartData,
  label,
  initialTab = 0,
  tableData2,
  label2,
  TableComponent,
}: Props) => {
  const [tabIndex, setTabIndex] = useState(initialTab);

  return (
    <Box>
      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
        <Tab label="グラフ" />
        <Tab label="数値データ" />
      </Tabs>
      <Box mt={2}>
        {tabIndex === 0 && <AssigneeLineChart data={chartData} />}
        {tabIndex === 1 && (
          <TableComponent
            data={tableData}
            label={label}
            data2={tableData2}
            label2={label2}
          />
        )}
      </Box>
    </Box>
  );
};

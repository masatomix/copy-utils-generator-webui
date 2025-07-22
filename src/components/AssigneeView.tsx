import {
  Box,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import type { LongData } from "evmtools-node/domain";
import { AssigneeLineChart } from "./AssigneePvChart";

import ReplayIcon from "@mui/icons-material/Replay";

type Props = {
  tableData: LongData[];
  chartData: LongData[];
  label: string;
  tableData2?: LongData[];
  label2?: string;
  initialTab?: number;
  TableComponent: React.ComponentType<{
    data: LongData[];
    label?: string;
    data2?: LongData[];
    label2?: string;
  }>;
};

const DEFAULT_LIMIT_DATE = new Date("2025-09-11");
const DEFAULT_BUFFER_RATE = 1.2;
const DEFAULT_VIEW_REGRESSION = true;

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
  const [limitDate, setLimitDate] = useState<Date | undefined>(
    DEFAULT_LIMIT_DATE
  );
  const [bufferRate, setBufferRate] = useState<number>(DEFAULT_BUFFER_RATE);
  const [viewRegression, setViewRegression] = useState<boolean>(
    DEFAULT_VIEW_REGRESSION
  );

  const handleReset = () => {
    setLimitDate(DEFAULT_LIMIT_DATE);
    setBufferRate(DEFAULT_BUFFER_RATE);
    setViewRegression(DEFAULT_VIEW_REGRESSION);
  };

  const isInitialState =
    limitDate?.toISOString() === DEFAULT_LIMIT_DATE.toISOString() &&
    bufferRate === DEFAULT_BUFFER_RATE &&
    viewRegression === DEFAULT_VIEW_REGRESSION;

  return (
    <Box>
      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
        <Tab label="グラフ" />
        <Tab label="数値データ" />
      </Tabs>

      <Box mt={2}>
        {tabIndex === 0 && (
          <>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                {/* 説明文（左） */}
                <Box flex="1" minWidth={200}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    回帰線の表示有無や〆切日(縦線)、バッファ比率(デフォルト値
                    {DEFAULT_BUFFER_RATE})などを指定できます。
                  </Typography>
                </Box>

                {/* コントロール群（右） */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Tooltip title="初期値に戻す">
                    <IconButton
                      onClick={handleReset}
                      disabled={isInitialState}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#fff3e0",
                        },
                      }}
                    >
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={viewRegression}
                        onChange={(e) => setViewRegression(e.target.checked)}
                      />
                    }
                    label="回帰線を表示"
                  />

                  <TextField
                    type="date"
                    label="〆切日"
                    InputLabelProps={{ shrink: true }}
                    value={
                      limitDate ? limitDate.toISOString().substring(0, 10) : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setLimitDate(val ? new Date(val) : undefined);
                    }}
                    size="small"
                  />

                  <Tooltip title="拡張横線を表示する際の倍率（1.0 = 等倍）">
                    <TextField
                      type="number"
                      label="バッファ比率"
                      inputProps={{ step: 0.1, min: 0 }}
                      value={bufferRate}
                      onChange={(e) => setBufferRate(Number(e.target.value))}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Paper>

            <AssigneeLineChart
              data={chartData}
              bufferRate={bufferRate}
              limitDate={limitDate}
              viewRegression={viewRegression}
            />
          </>
        )}

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

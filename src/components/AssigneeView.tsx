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
import { useRef, useState } from "react";
import type { LongData, ProjectStatistics } from "evmtools-node/domain";
import { AssigneeLineChart } from "./AssigneePvChart";

import ReplayIcon from "@mui/icons-material/Replay";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { excelBuffer2json } from "excel-csv-read-write";

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
  DEFAULT_LIMIT_DATE?: Date;
  DEFAULT_BUFFER_RATE?: number;
  DEFAULT_VIEW_REGRESSION?: boolean;
  seriesUpload?: boolean;
};

export const AssigneeView = ({
  tableData,
  chartData,
  label,
  initialTab = 0,
  tableData2,
  label2,
  TableComponent,
  DEFAULT_LIMIT_DATE,
  DEFAULT_BUFFER_RATE = 1.2,
  DEFAULT_VIEW_REGRESSION = false,
  seriesUpload = false,
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
    limitDate?.toISOString() === DEFAULT_LIMIT_DATE?.toISOString() &&
    bufferRate === DEFAULT_BUFFER_RATE &&
    viewRegression === DEFAULT_VIEW_REGRESSION;

  const [uploadedEvData, setUploadedEvData] = useState<EvData[] | undefined>(
    undefined
  );

  // input参照用
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ファイル選択時の処理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedEvData([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = (await excelBuffer2json(
        arrayBuffer,
        "プロジェクト時系列情報"
      )) as ProjectStatistics[];
      console.table(data);

      const evData: EvData[] = data.map((d) => {
        return { baseDate: d.baseDate, ev: d.totalEv };
      });

      setUploadedEvData(evData);

      // console.log("✅ JSON から読み込み成功:", mergedStats);
    } catch (err) {
      console.error("❌ JSON 読み込みエラー:", err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Box>
      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
        <Tab label="グラフ" />
        <Tab label="数値データ" />
      </Tabs>

      <>
        <input
          type="file"
          accept=".xlsm,.xlsx"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        {seriesUpload && (
          <Tooltip title="時系列EVデータをアップロード">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{ "&:hover": { backgroundColor: "#e8f5e9" } }}
            >
              <UploadFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </>

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
              evData={uploadedEvData}
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

export type EvData = {
  baseDate: string;
  ev?: number;
};

// const evData = [
//   { baseDate: "2025/06/16", ev: 0.0 },
//   { baseDate: "2025/06/17", ev: 2.63 },
//   { baseDate: "2025/06/18", ev: 5.26 },
//   { baseDate: "2025/06/19", ev: 7.89 },
//   { baseDate: "2025/06/20", ev: 10.53 },
//   { baseDate: "2025/06/21", ev: 13.16 },
//   { baseDate: "2025/06/22", ev: 15.79 },
//   { baseDate: "2025/06/23", ev: 18.42 },
//   { baseDate: "2025/06/24", ev: 21.05 },
//   { baseDate: "2025/06/25", ev: 23.68 },
//   { baseDate: "2025/06/26", ev: 26.32 },
//   { baseDate: "2025/06/27", ev: 28.95 },
//   { baseDate: "2025/06/28", ev: 31.58 },
//   { baseDate: "2025/06/29", ev: 34.21 },
//   { baseDate: "2025/06/30", ev: 36.84 },
//   { baseDate: "2025/07/01", ev: 39.47 },
//   { baseDate: "2025/07/02", ev: 42.11 },
//   { baseDate: "2025/07/03", ev: 44.74 },
//   { baseDate: "2025/07/04", ev: 47.37 },
//   { baseDate: "2025/07/05", ev: 50.0 },
//   { baseDate: "2025/07/06", ev: 52.63 },
//   { baseDate: "2025/07/07", ev: 55.26 },
//   { baseDate: "2025/07/08", ev: 57.89 },
//   { baseDate: "2025/07/09", ev: 60.53 },
//   { baseDate: "2025/07/10", ev: 63.16 },
//   { baseDate: "2025/07/11", ev: 65.79 },
//   { baseDate: "2025/07/12", ev: 68.42 },
//   { baseDate: "2025/07/13", ev: 71.05 },
//   { baseDate: "2025/07/14", ev: 73.68 },
//   { baseDate: "2025/07/15", ev: 76.32 },
//   { baseDate: "2025/07/16", ev: 78.95 },
//   { baseDate: "2025/07/17", ev: 81.58 },
//   { baseDate: "2025/07/18", ev: 84.21 },
//   { baseDate: "2025/07/19", ev: 86.84 },
//   { baseDate: "2025/07/20", ev: 89.47 },
//   { baseDate: "2025/07/21", ev: 92.11 },
//   { baseDate: "2025/07/22", ev: 94.74 },
//   { baseDate: "2025/07/23", ev: 97.37 },
//   { baseDate: "2025/07/24", ev: 100.0 },
// ];

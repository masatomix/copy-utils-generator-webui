// src/components/MultiFileProjectLoader.tsx

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import { Project, type ProjectStatistics } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";
import { HelpPopover } from "./Evm";

type ProjectEntry = {
  fileName: string;
  project: Project;
};

const EvmSeries: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [projectStatisticsArray, setProjectStatisticsArray] = useState<
    ProjectStatistics[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const fileArray = Array.from(files);
    setIsLoading(true); // ローディング開始
    console.log(
      "📂 選択されたファイル:",
      fileArray.map((f) => f.name)
    );

    try {
      const promises = fileArray.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const projectName = file.name.replace(/\.[^/.]+$/, "");
        const creator = new ExcelBufferProjectCreator(arrayBuffer, projectName);
        const project = await creator.createProject();
        return { fileName: file.name, project };
      });

      const projects = await Promise.all(promises);
      setProjects(projects);
      console.log("✅ 全ファイル読み込み成功:", projects);
      const results = handleDiffs(projects); // ← 差分処理
      setProjectStatisticsArray(results);
    } catch (error) {
      console.error("❌ 読み込み失敗:", error);
    } finally {
      setIsLoading(false); // ローディング開始
    }
  };

  // const sv = subtract(row.totalEv, row.totalPvCalculated);
  // const svColor = sv! < 0 ? "error.main" : "inherit"; // svでも、spiで判定してもほぼ同じ

  const sv = 10;
  const svColor = "inherit";

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        複数Excelファイルからプロジェクト読込
      </Typography>

      <input
        type="file"
        id="file-upload"
        accept=".xlsm,.xlsx"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
        >
          Excelファイルを選択
        </Button>
      </label>

      {isLoading && (
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <CircularProgress size={24} />
          <Typography>読み込み中です…</Typography>
        </Box>
      )}

      {projects.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            読み込んだプロジェクト一覧
          </Typography>
          <List>
            {projects.map((entry, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={entry.fileName}
                  secondary={`タスク数: ${entry.project.length}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {projectStatisticsArray.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            差分統計（baseDate の新しい順）
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ファイル名</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    プロジェクト名
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    開始予定日
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    終了予定日
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    タスク数
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    工数合計
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    工数平均
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    基準日
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    PV
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    EV
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    EV-PV
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    SPI
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectStatisticsArray.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{projects[idx]?.fileName ?? "-"}</TableCell>

                    <TableCell>{row.projectName ?? "-"}</TableCell>
                    <TableCell align="right">{row.startDate}</TableCell>
                    <TableCell align="right">{row.endDate}</TableCell>
                    <TableCell align="right">
                      {row.totalTasksCount ?? "-"}
                    </TableCell>

                    <TableCell align="right">
                      {row.totalWorkloadCalculated ?? "-"}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumberIntl(row.averageWorkload, {
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                    <TableCell align="right">{row.baseDate}</TableCell>

                    <TableCell align="right">
                      {formatNumberIntl(row.totalPvCalculated, {
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumberIntl(row.totalEv, {
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                    <TableCell
                      align="right"
                      component="span"
                      sx={{ color: svColor }}
                    >
                      {formatNumberIntl(sv, {
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                    <TableCell
                      align="right"
                      component="span"
                      sx={{ color: svColor }}
                    >
                      {formatNumberIntl(row.spi, {
                        maximumFractionDigits: 3,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default EvmSeries;

function handleDiffs(projects: ProjectEntry[]) {
  // ① baseDate が新しい順に並べる
  const sorted = [...projects].sort(
    (a, b) => b.project.baseDate.getTime() - a.project.baseDate.getTime()
  );

  const stats = sorted.map((entry) => entry.project.statisticsByProject[0]);
  console.table(stats);
  return stats;
}

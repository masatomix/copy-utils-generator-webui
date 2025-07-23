// src/components/MultiFileProjectLoader.tsx

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
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
import { ShowProjectStatistics } from "../components/project/ShowProjectStatistics";

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

      // ① baseDate が新しい順に並べる
      const sorted = [...projects].sort(
        (a, b) => b.project.baseDate.getTime() - a.project.baseDate.getTime()
      );
      const results = sorted.map(
        (entry) => entry.project.statisticsByProject[0]
      );
      setProjectStatisticsArray(results);
    } catch (error) {
      console.error("❌ 読み込み失敗:", error);
    } finally {
      setIsLoading(false); // ローディング開始
    }
  };

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
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ファイル名</TableCell>
                <TableCell>タスク数(含 親タスク)</TableCell>
                <TableCell>タスク数(子タスク)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{entry.fileName}</TableCell>
                  <TableCell>{entry.project.length}</TableCell>
                  <TableCell>
                    {
                      entry.project.toTaskRows().filter((task) => task.isLeaf)
                        .length
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {projectStatisticsArray.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            時系列データ
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
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
                  <ShowProjectStatistics
                    row={row}
                    idx={idx}
                  ></ShowProjectStatistics>
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

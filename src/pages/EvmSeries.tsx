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

import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import { Project, type ProjectStatistics } from "evmtools-node/domain";
import { ShowProjectStatistics } from "../components/project/ShowProjectStatistics";
import saveAs from "file-saver";
import {
  createWorkbook,
  excelBuffer2json,
  json2workbook,
} from "excel-csv-read-write";
import { createStyles } from "evmtools-node/common";

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
    // setProjects([]);
    // setProjectStatisticsArray([]);

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

      const newProjects = await Promise.all(promises);
      const mergedProjects = mergeProjects(projects, newProjects);
      setProjects(mergedProjects);

      console.log("✅ 全ファイル読み込み成功:", projects);

      // ① baseDate が新しい順に並べる
      const sorted = [...mergedProjects].sort(
        (a, b) => b.project.baseDate.getTime() - a.project.baseDate.getTime()
      );
      const results = sorted.map(
        (entry) => entry.project.statisticsByProject[0]
      );
      const mergedStats = mergeStatistics(projectStatisticsArray, results);
      setProjectStatisticsArray(mergedStats);
    } catch (error) {
      console.error("❌ 読み込み失敗:", error);
    } finally {
      setIsLoading(false); // ローディング開始
    }
  };

  const mergeProjects = (
    existing: ProjectEntry[],
    incoming: ProjectEntry[]
  ): ProjectEntry[] => {
    const map = new Map<string, ProjectEntry>();
    for (const entry of existing) {
      map.set(entry.project.name!, entry);
    }
    for (const entry of incoming) {
      map.set(entry.project.name!, entry); // 上書き or 新規
    }
    return Array.from(map.values());
  };

  const handleImportSeries = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = (await excelBuffer2json(
        arrayBuffer,
        "プロジェクト時系列情報"
      )) as ProjectStatistics[];
      console.table(data);

      const mergedStats = mergeStatistics(projectStatisticsArray, data);
      setProjectStatisticsArray(mergedStats);

      // console.log("✅ JSON から読み込み成功:", mergedStats);
    } catch (err) {
      console.error("❌ JSON 読み込みエラー:", err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const mergeStatistics = (
    existing: ProjectStatistics[],
    incoming: ProjectStatistics[]
  ): ProjectStatistics[] => {
    const map = new Map<string, ProjectStatistics>();
    for (const stat of existing) {
      map.set(stat.projectName!, stat);
    }
    for (const stat of incoming) {
      map.set(stat.projectName!, stat); // ← 上書き or 新規追加
    }
    // return Array.from(map.values());
    // 基準日で降順ソート（新しい順）
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.baseDate).getTime() - new Date(a.baseDate).getTime()
    );
  };

  const downloadAll = async () => {
    if (projectStatisticsArray.length === 0) {
      console.warn("⚠️ 書き出し対象が空です");
      return;
    }

    const path = `${projectStatisticsArray[0].projectName}-series.xlsx`;
    const workbook = await createWorkbook();

    console.table(projectStatisticsArray);
    json2workbook({
      instances: projectStatisticsArray,
      workbook,
      sheetName: `プロジェクト時系列情報`,
      applyStyles: createStyles(),
    });

    workbook.deleteSheet("Sheet1");
    const arrayBuffer = await workbook.outputAsync();
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }); // Blob に変換

    saveAs(blob, path);
  };

  const handleResetStatistics = () => {
    setProjectStatisticsArray([]);
    setProjects([]);
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
      <input
        type="file"
        id="file-upload1"
        accept=".xlsm,.xlsx"
        style={{ display: "none" }}
        onChange={handleImportSeries}
      />
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {/* Excelファイル選択 */}
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
          >
            Excelファイルを選択
          </Button>
        </label>

        {/* 作成済みデータ取り込み */}
        <label htmlFor="file-upload1">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
          >
            作成済み時系列データの取り込み
          </Button>
        </label>

        {/* リセット */}
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleResetStatistics}
          sx={{ minWidth: "auto" }}
        >
          リセット
        </Button>
      </Box>

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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" gutterBottom>
              時系列データ({projectStatisticsArray.length}件)
            </Typography>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadAll}
              sx={{ mt: 2 }}
            >
              データをダウンロード
            </Button>
          </Box>

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

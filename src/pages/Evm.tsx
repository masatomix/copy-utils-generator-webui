import { useState } from "react";
import {
  excelBuffer2json,
  json2workbook,
  createWorkbook,
} from "excel-csv-read-write";
import {
  parseClassName,
  parsePackageName,
} from "copy-utils-generator/infrastructure";
import type { ClassInfo } from "copy-utils-generator/domain";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import type {
  ProjectRepository,
  AssigneeStatistics,
  ProjectStatistics,
  Project,
} from "evmtools-node/domain";
import { dateStr, createStyles } from "evmtools-node/common";
import type { Workbook } from "xlsx-populate";

function Evm() {
  const [fileName, setFileName] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<Array<string>>([]);
  const [classInfos, setClassInfos] = useState<Array<ClassInfo>>([]);
  const [project, setProject] = useState<Project>();
  const [workbook, setWorkbook] = useState<Workbook | undefined>();
  const [path, setPath] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    setGeneratedCodes([]);
    setClassInfos([]);
    setWorkbook(undefined);

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        console.error("FileReader result is not an ArrayBuffer");
        return;
      }
      try {
        const projectName = getFilenameWithoutExtension(file.name);

        const creator = new ExcelBufferProjectCreator(arrayBuffer, projectName);
        const repository = new InMemoryRepository();

        const project = await creator.createProject();
        repository.save(project);
        setProject((prev) => project);

        console.log("読み込み成功", project.length, " 件");
      } catch (error) {
        console.error("読み込み失敗", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getFilenameWithoutExtension = (fullPath: string): string => {
    const filename = fullPath.split(/[/\\]/).pop() ?? "";
    return filename.replace(/\.[^/.]+$/, ""); // 最後の .xxx を除去
  };

  class InMemoryRepository implements ProjectRepository {
    save(project: Project): void {
      const projectData = project.printAndGetRawData(20);

      const baseDate = project.baseDate;
      const projectName = project.name;

      const statisticsByProject = project.statisticsByProject;
      const statisticsByName = project.statisticsByName;

      const pvByProject = project.pvByProject;
      const pvsByProject = project.pvsByProject;
      const pvByName = project.pvByName;
      const pvsByName = project.pvsByName;
      const path = `${projectName}-summary.xlsx`;

      this.writeProjectInfo({
        statisticsByProject,
        statisticsByName,
        pvByProject,
        pvsByProject,
        pvByName,
        pvsByName,
        projectData,
        baseDate,
        path,
      });
    }

    writeProjectInfo: (data: {
      statisticsByProject?: ProjectStatistics[];
      statisticsByName?: AssigneeStatistics[];
      pvByProject?: Record<string, unknown>[];
      pvsByProject?: Record<string, unknown>[];
      pvByName?: Record<string, unknown>[];
      pvsByName?: Record<string, unknown>[];
      projectData?: Record<string, unknown>[];
      baseDate: Date;
      path: string;
    }) => Promise<void> = async ({
      statisticsByProject,
      statisticsByName,
      pvByProject,
      pvsByProject,
      pvByName,
      pvsByName,
      projectData,
      baseDate,
      path,
    }) => {
      const workbook = await createWorkbook();

      const dateStrHyphen = dateStr(baseDate).replace(/\//g, "-");

      if (statisticsByProject) {
        console.log("プロジェクト情報");
        console.table(statisticsByProject);
        json2workbook({
          instances: statisticsByProject,
          workbook,
          sheetName: `プロジェクト情報`,
          applyStyles: createStyles(),
        });
      }
      if (statisticsByName) {
        console.log("要員ごと統計");
        console.table(statisticsByName);
        json2workbook({
          instances: statisticsByName,
          workbook,
          sheetName: "要員ごと統計",
          applyStyles: createStyles(),
        });
      }

      if (pvByProject) {
        json2workbook({
          instances: pvByProject,
          workbook,
          sheetName: `プロジェクト日ごとPV`,
          applyStyles: createStyles(),
        });
      }
      if (pvsByProject) {
        json2workbook({
          instances: pvsByProject,
          workbook,
          sheetName: `プロジェクト日ごと累積PV`,
          applyStyles: createStyles(),
        });
      }

      if (pvByName) {
        json2workbook({
          instances: pvByName,
          workbook,
          sheetName: `要員ごと・日ごとPV`,
          applyStyles: createStyles(),
        });
      }
      if (pvsByName) {
        json2workbook({
          instances: pvsByName,
          workbook,
          sheetName: `要員ごと・日ごと累積PV`,
          applyStyles: createStyles(),
        });
      }

      if (projectData) {
        json2workbook({
          instances: projectData,
          workbook,
          sheetName: `素データ_${dateStrHyphen}`,
          applyStyles: createStyles(),
        });
      }
      workbook.deleteSheet("Sheet1");
      // await toFileAsync(workbook, path);

      // ココに更新内容保存処理。
      setWorkbook((prev) => workbook);
      setPath((prev) => path);
    };
  }

  const downloadCode = (index: number) => {
    const classInfo = classInfos[index];
    const className = parseClassName(classInfo.className);
    const blob = new Blob([generatedCodes[index]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${className}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (workbook) {
      const blob = await workbook.outputAsync();
      saveAs(blob, path);
    }
  };

  const renderCodeAccordion = () =>
    generatedCodes.map((code, index) => {
      const fqcn = classInfos[index].className;
      return (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {index + 1}: {fqcn}.java
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component="pre"
              p={2}
              sx={{ bgcolor: "#f4f4f4", whiteSpace: "pre-wrap" }}
            >
              <Tooltip title="クリップボードにコピー">
                <IconButton
                  size="small"
                  sx={{ position: "absolute", right: 30 }}
                  onClick={() => navigator.clipboard.writeText(code)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {code}
            </Box>
            <Button
              variant="outlined"
              onClick={() => downloadCode(index)}
              sx={{ mt: 1 }}
            >
              このファイルをダウンロード
            </Button>
          </AccordionDetails>
        </Accordion>
      );
    });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        EVM Generator Web UI (Demo)
      </Typography>

      <Typography gutterBottom>
        五反田式進捗管理ツール(Ver.7.3).xlsm などを指定してください。
      </Typography>

      <Button variant="contained" component="label">
        Excelファイルを選択
        <input type="file" accept=".xlsm" hidden onChange={onFileChange} />
      </Button>

      <Button
        href={`${import.meta.env.BASE_URL}五反田式進捗管理ツール(Ver.7.3).xlsm`}
        download
        size="small"
        variant="text"
        sx={{ textTransform: "none", mt: 1 }}
      >
        サンプルのダウンロード
      </Button>
      {fileName && (
        <Typography variant="body2" mt={1}>
          読み込みファイル: {fileName}
        </Typography>
      )}

      {project && project.length > 0 && (
        <Box mt={4}>
          <Typography gutterBottom>タスク数 {project.length} 件</Typography>
          <Button variant="outlined" onClick={downloadAll} sx={{ mb: 2 }}>
            ダウンロード
          </Button>
          {renderCodeAccordion()}
        </Box>
      )}
    </Box>
  );
}

export default Evm;

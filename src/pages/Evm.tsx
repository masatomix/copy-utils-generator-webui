import { useState } from "react";
import { saveAs } from "file-saver";
import { Button, Typography, Box, Paper, Stack, Divider } from "@mui/material";
import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import type {
  AssigneeStatistics,
  Project,
  ProjectStatistics,
} from "evmtools-node/domain";
import type { Workbook } from "xlsx-populate";
import { InMemoryRepository } from "../repository/InMemoryRepository";
import { AssigneeStatsTable } from "../components/AssigneeStatsTable";

import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import { ProjectStatsTable } from "../components/ProjectStatsTable";
import { AssigneeLineChart } from "../components/AssigneePvChart";
import { AssigneeView } from "../components/AssigneeView";

export type ProjectInfoCallbacks = {
  updateState: (updater: (prev: State) => State) => void;
};

type State = {
  fileName: string;
  project?: Project;
  workbook?: Workbook;
  path: string;
  statisticsByName: AssigneeStatistics[];
  statisticsByProject: ProjectStatistics[];
};

function Evm() {
  const [state, setState] = useState<State>({
    fileName: "",
    project: undefined,
    workbook: undefined,
    path: "",
    statisticsByName: [],
    statisticsByProject: [],
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState((prev) => ({
      ...prev,
      fileName: file.name,
    }));

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
        const repository = new InMemoryRepository({
          updateState: setState,
        });

        const project = await creator.createProject();
        repository.save(project);
        setState((s) => ({ ...s, project }));

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

  const downloadAll = async () => {
    if (state.workbook) {
      const arrayBuffer = await state.workbook.outputAsync();
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }); // Blob に変換

      saveAs(blob, state.path);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        EVM Generator Web UI (Demo)
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        五反田式進捗管理ツール（Ver.7.3）に対応しています。
      </Typography>

      {/* ファイル選択セクション */}
      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          ファイル読み込み
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
          >
            Excelファイルを選択
            <input type="file" accept=".xlsm" hidden onChange={onFileChange} />
          </Button>

          <Button
            href={`${
              import.meta.env.BASE_URL
            }五反田式進捗管理ツール(Ver.7.3).xlsm`}
            download
            size="small"
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            サンプルファイルDL
          </Button>
        </Stack>

        {state.fileName && (
          <Typography variant="body2" mt={2}>
            選択中のファイル: <strong>{state.fileName}</strong>
          </Typography>
        )}
      </Paper>

      {/* プロジェクト情報 */}
      {state.statisticsByProject.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            プロジェクト情報
          </Typography>

          <Divider sx={{ mb: 2 }} />
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadAll}
            sx={{ mt: 2 }}
          >
            データをダウンロード
          </Button>
          <ProjectStatsTable data={state.statisticsByProject} />
        </Paper>
      )}

      {/* 要員統計 */}
      {state.statisticsByName.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            要員ごと統計
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <AssigneeStatsTable data={state.statisticsByName} />
        </Paper>
      )}

      {/* PVs推移グラフ(プロジェクト) */}
      {state.project && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            プロジェクトのPV累積チャート
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <AssigneeView
            tableData={state.project.pvByProjectLong}
            chartData={state.project.pvsByProjectLong}
            label="PV累積"
          />
        </Paper>
      )}

      {/* PVS推移グラフ(ひとごと) */}
      {state.project && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            要員ごとのPV累積チャート
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <AssigneeView
            tableData={state.project.pvByNameLong}
            chartData={state.project.pvsByNameLong}
            label="PV累積"
          />
        </Paper>
      )}
    </Box>
  );
}

export default Evm;

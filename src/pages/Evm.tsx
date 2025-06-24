import { useState } from "react";
import { saveAs } from "file-saver";
import { Button, Typography, Box } from "@mui/material";
import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import type { AssigneeStatistics, Project } from "evmtools-node/domain";
import type { Workbook } from "xlsx-populate";
import { InMemoryRepository } from "../repository/InMemoryRepository";
import { AssigneeStatsTable } from "../components/AssigneeStatsTable";

// export type ProjectInfoCallbacks = {
//   onWorkbookCreated: React.Dispatch<React.SetStateAction<Workbook | undefined>>;
//   onPathCreated: React.Dispatch<React.SetStateAction<string>>;
// };

export type ProjectInfoCallbacks = {
  updateState: (updater: (prev: State) => State) => void;
};

type State = {
  fileName: string;
  project?: Project;
  workbook?: Workbook;
  path: string;
  statisticsByName: AssigneeStatistics[];
};

function Evm() {
  const [state, setState] = useState<State>({
    fileName: "",
    project: undefined,
    workbook: undefined,
    path: "",
    statisticsByName: [],
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
      {state.fileName && (
        <Typography variant="body2" mt={1}>
          読み込みファイル: {state.fileName}
        </Typography>
      )}

      {state.project && state.project.length > 0 && (
        <Box mt={4}>
          <Typography gutterBottom>
            タスク数 {state.project.length} 件
          </Typography>
          <Button variant="outlined" onClick={downloadAll} sx={{ mb: 2 }}>
            概況ダウンロード
          </Button>
        </Box>
      )}
      {state.statisticsByName.length > 0 && (
        <>
          <Typography gutterBottom>要員ごと統計</Typography>
          <AssigneeStatsTable data={state.statisticsByName} />
        </>
      )}
    </Box>
  );
}

export default Evm;

import { useRef, useState } from "react";
import { saveAs } from "file-saver";
import {
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Popover,
} from "@mui/material";
import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import {
  ProjectService,
  type AssigneeDiff,
  type AssigneeStatistics,
  type Project,
  type ProjectDiff,
  type ProjectStatistics,
  type TaskDiff,
} from "evmtools-node/domain";
import type { Workbook } from "xlsx-populate";
import { InMemoryRepository } from "../repository/InMemoryRepository";

import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import { AssigneeView } from "../components/AssigneeView";
import { LongDataByNameTable } from "../components/LongDataByNameTable";
import { LongDataByProjectTable } from "../components/LongDataByProjectTable";
import { ProjectStatsView } from "../components/ProjectStatsView";
import { AssigneeStatsView } from "../components/AssigneeStatsView";
import { TaskDiffTable } from "../components/TaskDiffTable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import React from "react";

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
  prevProject?: Project; // ← 前回のデータ
  taskDiffs: TaskDiff[]; // ← 差分結果
  projectDiffs: ProjectDiff[]; //
  assigneeDiffs: AssigneeDiff[]; //
};

function Evm() {
  const [state, setState] = useState<State>({
    fileName: "",
    project: undefined,
    workbook: undefined,
    path: "",
    statisticsByName: [],
    statisticsByProject: [],
    prevProject: undefined, // ← 前回のデータ
    taskDiffs: [], // ← 差分結果
    projectDiffs: [], // ← 差分結果
    assigneeDiffs: [], // ← 差分結果
  });

  // ref を定義
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevFileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 同じファイル再選択に対応するため value をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setState((prev) => ({
      ...prev,
      fileName: file.name,
      prevProject: undefined, // ← 前回プロジェクトを削除
      taskDiffs: [], // ← 差分もリセット（あれば）
      projectDiffs: [], // ← 差分結果
      assigneeDiffs: [], // ← 差分結果
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

  const onPrevFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      if (!(arrayBuffer instanceof ArrayBuffer)) return;

      try {
        const projectName = getFilenameWithoutExtension(file.name);
        const creator = new ExcelBufferProjectCreator(arrayBuffer, projectName);
        const prevProject = await creator.createProject();

        function calculateDiffs(
          project: Project | undefined,
          prev: Project | undefined,
          service: ProjectService
        ) {
          if (!project || !prev)
            return { taskDiffs: [], projectDiffs: [], assigneeDiffs: [] };

          return {
            taskDiffs: service.calculateTaskDiffs(project, prev),
            projectDiffs: service.calculateProjectDiffs(project, prev),
            assigneeDiffs: service.calculateAssigneeDiffs(project, prev),
          };
        }

        setState((s) => {
          const projectSevice = new ProjectService();
          const {
            taskDiffs, //
            projectDiffs, //
            assigneeDiffs, //
          } = calculateDiffs(s.project, prevProject, projectSevice);

          return { ...s, prevProject, taskDiffs, projectDiffs, assigneeDiffs };
        });
      } catch (error) {
        console.error("prev読み込み失敗", error);
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

  const FileSelectButton = ({
    label,
    onChange,
    accept = ".xlsm",
    icon,
    fileInputRef,
  }: {
    label: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    icon: React.ReactNode;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    return (
      <Button variant="contained" component="label" startIcon={icon}>
        {label}
        <input
          type="file"
          accept={accept}
          hidden
          onChange={onChange}
          ref={fileInputRef}
        />
      </Button>
    );
  };

  return (
    <Box p={4} width="100%">
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">EVM Tools Web UI (Demo)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" gutterBottom>
            このツールは、五反田式進捗管理ツール（Ver.7.3）に対応した Excel
            ファイルを読み込み、
            プロジェクトの進捗状況や要員別の作業量を可視化する Web
            アプリケーションです。
          </Typography>
          <Typography variant="subtitle1">主な機能:</Typography>
          <ul>
            <li>Excel ファイルからプロジェクト情報の読み込み</li>
            <li>PV（作業量）の集計・グラフ表示（プロジェクト・要員単位）</li>
            <li>
              前回ファイルとの比較による差分表示（タスク、プロジェクト、要員）
            </li>
            <li>統計情報の表示とダウンロード</li>
          </ul>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            使い方:
          </Typography>
          <ol>
            <li>
              「Excelファイルを選択」ボタンから対象ファイルを読み込みます。
            </li>
            <li>
              （任意）前回データと比較したい場合は、「前回ファイルを選択」ボタンから比較対象のファイルを選択します。
            </li>
            <li>読み込んだデータがページ下部に表示されます。</li>
            <li>
              必要に応じて「データをダウンロード」ボタンからExcel形式で保存できます。
            </li>
          </ol>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ※ 本ツールはローカルで完結するため、データはアップロードされません。
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* ファイル選択セクション */}
      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" gutterBottom>
            ファイル読み込み
          </Typography>
          <HelpPopover
            title="Excelファイルを選択"
            content={`五反田式進捗管理ツール形式の xlsmファイルを選択してください。
              サンプルファイルDLでは、サンプルファイルをダウンロードできます。`}
          />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <FileSelectButton
            label="Excelファイルを選択"
            icon={<UploadIcon />}
            onChange={onFileChange}
            fileInputRef={fileInputRef}
          />
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
          {state.project && (
            <Stack direction="row" spacing={1} alignItems="center">
              <FileSelectButton
                label="前回ファイルを選択"
                icon={<UploadIcon />}
                onChange={onPrevFileChange}
                fileInputRef={prevFileInputRef}
              />
              <HelpPopover
                title="前回ファイルを選択"
                content="差分を比較したい前回のExcelファイルを選択してください。タスクごとの変化が表示されます。"
              />
            </Stack>
          )}
        </Stack>

        {state.fileName && (
          <Typography variant="body2" mt={2}>
            選択中のファイル: <strong>{state.fileName}</strong>
          </Typography>
        )}
      </Paper>

      {state.taskDiffs.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <TaskDiffTable data={state.taskDiffs} />
        </Paper>
      )}

      {/* プロジェクト情報 */}
      {state.statisticsByProject.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">プロジェクト情報</Typography>
            <HelpPopover
              title="このセクションについて"
              content={`このセクションでは、プロジェクト全体の統計情報を表示します。

項目説明:

プロジェクト名
Excelファイル内のファイル名から取得したプロジェクトの名前です。

開始予定日
最も早いタスクの「開始予定日」です。

終了予定日
最も遅いタスクの「終了予定日」です。

タスク数
プロジェクト内に登録されているタスクの総数です。

工数合計
すべてのタスクに割り当てられた工数（予定工数）の合計です。人日単位です。タスクごとに日ごとのPVを算出し、それらを全部足し合わせます。
開始日/終了日が未入力のタスクは1日あたりの工数が計算できないため除外しているなど、Excelファイル上の「予定工数」の総和とは異なる場合があります。

工数平均
タスク1件あたりの平均工数です（＝工数合計 ÷ タスク数）。

基準日
Excelファイルから取得した基準日です。

PV（Planned Value）
基準日終了時点での予定工数の合計(1日あたりの工数 x 経過した日数)です。
「1日あたりの工数」は、タスクごとにExcelの「稼働予定日数」と「予定工数」から算出。
「基準日時点の経過日数」は、Excelファイル上のプロットをみながら、プロットの日付<=基準日 の個数で算出。
(親タスクの工数は二重計上となるため除外)

EV（Earned Value）
基準日終了時点のExcel上のEVの合計です。

EV-PV
EVとPVの差（＝EV − PV）です。プラスなら予定より進捗が早く、マイナスなら遅れています。

SPI（Schedule Performance Index）
スケジュール効率指数。EV ÷ PV で算出されます。
1.0以上なら順調、1.0未満なら遅れを示します。
                `}
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadAll}
              sx={{ mt: 2 }}
            >
              データをダウンロード
            </Button>
            <HelpPopover
              title="データをダウンロード"
              content="Excel形式で素データをダウンロードできます。"
            />
          </Stack>
          <ProjectStatsView data={state.statisticsByProject} />
        </Paper>
      )}

      {/* 要員統計 */}
      {state.statisticsByName.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">要員ごと統計</Typography>
            <HelpPopover
              title="要員ごと統計"
              content={`このセクションでは、担当者ごとの統計情報を表示します。

                項目説明:

                担当者
                タスクの担当者名です。
                
                タスク数
                プロジェクト全体で、担当者に割り当てられているタスクの総数です。
                
                工数合計、工数平均、PV、EV、EV-PV、SPI
                計算方法は、プロジェクト情報の定義とおなじ。ひとごとで計算。
              `}
            />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <AssigneeStatsView data={state.statisticsByName} />
        </Paper>
      )}

      {/* PVs推移グラフ(プロジェクト) */}
      {state.project && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" gutterBottom>
              プロジェクトのPV累積グラフ
            </Typography>
            <HelpPopover
              title="このグラフについて"
              content="プロジェクト全体の日々のPVを確認できます。毎日の工数が適切かを確認するのに活用してください。"
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />
          <AssigneeView
            TableComponent={LongDataByProjectTable}
            tableData={state.project.pvByProjectLong}
            chartData={state.project.pvsByProjectLong}
            label="日々のPV"
            tableData2={state.project.pvsByProjectLong}
            label2="PV累積"
          />
        </Paper>
      )}

      {/* PVS推移グラフ(ひとごと) */}
      {state.project && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">要員ごとのPV累積グラフ</Typography>
            <HelpPopover
              title="このグラフについて"
              content="要員ごとの日々のPVを確認できます。毎日の工数が適切かを確認するのに活用してください。"
            />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <AssigneeView
            TableComponent={LongDataByNameTable}
            tableData={state.project.pvByNameLong}
            chartData={state.project.pvsByNameLong}
            label="PV累積"
            initialTab={1}
          />
        </Paper>
      )}
    </Box>
  );
}

// const HelpIcon = ({ message }: { message: string }) => (
//   <Tooltip title={message} arrow>
//     <IconButton size="small">
//       <HelpOutlineIcon fontSize="small" />
//     </IconButton>
//   </Tooltip>
// );

export const HelpPopover = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography
          sx={{
            p: 2,
            maxWidth: 500,
            whiteSpace: "pre-line", // 改行を反映させる
          }}
        >
          <strong>{title}</strong>
          <br />
          {content}
        </Typography>
      </Popover>
    </>
  );
};

export default Evm;

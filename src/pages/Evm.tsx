import { useMemo, useRef, useState } from "react";
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
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Project,
  type AssigneeStatistics,
  type ProjectStatistics,
} from "evmtools-node/domain";
import type { Workbook } from "xlsx-populate";

import UploadIcon from "@mui/icons-material/Upload";
import { AssigneeView } from "../components/AssigneeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
import { TaskDiffTabs } from "../components/diff/TaskDiffTabs";
import { createLongDataByNameTableWithProject } from "../components/LongDataByNameTableWrapper";
import { createLongDataByProjectTableWithProject } from "../components/LongDataByProjectTableWrapper";
import TaskRowsSection from "../components/task/TaskRowsSection";
import { HelpPopover } from "../components/HelpPopover";
import { StatisticsByProjectPaper } from "../components/project/StatisticsByProjectPaper";
import { StatisticsByAssigneePaper } from "../components/assignee/StatisticsByAssigneePaper";
import { handleFileChange } from "../utils/handleFileChange";
import { handlePrevFileChange } from "../utils/handlePrevFileChange";

type State = {
  fileName: string;
  project?: Project;
  workbook?: Workbook;
  path: string;
  statisticsByName: AssigneeStatistics[];
  statisticsByProject: ProjectStatistics[];
  prevProject?: Project; // ← 前回のデータ
  loading: boolean; // ← 追加
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
    loading: false, // ← 追加
  });

  const [snackbar, setSnackbar] = useState<string | null>(null);

  // ref を定義
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevFileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFileChange({
      file,
      resetFileInput: () => {
        // 同じファイル再選択に対応するため value をリセット
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      setLoading: (loading) => setState((s) => ({ ...s, loading })),
      setStateAfterGeneration: ({
        workbook,
        path,
        statisticsByName,
        statisticsByProject,
      }) => {
        setState((s) => ({
          ...s,
          workbook,
          path,
          statisticsByName,
          statisticsByProject,
          fileName: file.name,
          prevProject: undefined, // ← 前回プロジェクトを削除
        }));
      },
      setProject: (project: Project) => setState((s) => ({ ...s, project })),
      setSnackbar,
    });
  };

  const onPrevFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handlePrevFileChange({
      file,
      resetFileInput: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      setLoading: (loading) => setState((s) => ({ ...s, loading })),
      setPrevProject: (prevProject) =>
        setState((s) => ({
          ...s,
          prevProject,
        })),
      setSnackbar,
    });
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

  const LongDataByNameTableWithProject = useMemo(() => {
    return state.project
      ? createLongDataByNameTableWithProject(state.project)
      : null; // Projectをココで渡しちゃう
  }, [state.project]);

  const LongDataByProjectTableWithProject = useMemo(() => {
    return state.project
      ? createLongDataByProjectTableWithProject(state.project) // Projectをココで渡しちゃう
      : null;
  }, [state.project]);

  return (
    <Box p={4} width="100%">
      <Accordion>
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

      {state.project && state.prevProject && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Box display="flex" alignItems="baseline" gap={1}>
            <Typography variant="h6">直近情報</Typography>
            <Typography variant="body2">(前回ファイルとの差分)</Typography>
          </Box>
          <TaskDiffTabs current={state.project!} prev={state.prevProject!} />
        </Paper>
      )}

      {/* プロジェクト情報 */}
      {state.statisticsByProject.length > 0 && (
        <StatisticsByProjectPaper
          statisticsByProject={state.statisticsByProject}
          workbook={state.workbook}
          path={state.path}
        ></StatisticsByProjectPaper>
      )}

      {/* 要員統計 */}
      {state.statisticsByName.length > 0 && (
        <StatisticsByAssigneePaper
          statisticsByName={state.statisticsByName}
        ></StatisticsByAssigneePaper>
      )}

      {state.project && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h6">個別データ</Typography>
              <Typography variant="body2">(指定した基準日のタスク)</Typography>
            </Box>
            <Typography variant="h6" gutterBottom></Typography>
            <HelpPopover
              title="個別データ"
              content={`タスクごとの素データを表示しています。
                デフォルトは基準日で絞ってあるので「指定した基準日のタスク」を一覧できます。
            `}
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />
          <TaskRowsSection project={state.project} />
        </Paper>
      )}

      {/* PVs推移グラフ(プロジェクト) */}
      {state.project && (
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" gutterBottom>
              プロジェクトのPV累積グラフ(β版)
            </Typography>
            <HelpPopover
              title="このグラフについて"
              content="プロジェクト全体の日々のPVを確認できます。毎日の工数が適切かを確認するのに活用してください。"
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />
          <AssigneeView
            TableComponent={LongDataByProjectTableWithProject!}
            tableData={state.project.pvByProjectLong}
            // chartData={state.project.pvsByProjectLong.filter(
            //   (d) => !state.project?.isHoliday(new Date(d.baseDate))
            // )}
            chartData={state.project.pvsByProjectLong}
            label="日々のPV"
            tableData2={state.project.pvsByProjectLong}
            label2="PV累積"
            DEFAULT_LIMIT_DATE={new Date("2025-09-11")}
            // DEFAULT_BUFFER_RATE={1.2}
            DEFAULT_VIEW_REGRESSION={true}
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
              content="要員ごとの日々のPVを確認できます。毎日の工数が適切かを確認するのに活用してください。
            
              0 < PV < 0.8 の場合はセルを青く(タスク不足？)、PV > 1.0 の場合はセルを赤く(タスク過多？)しています。"
            />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <AssigneeView
            TableComponent={LongDataByNameTableWithProject!}
            tableData={state.project.pvByNameLong}
            chartData={state.project.pvsByNameLong}
            label="PV累積"
            initialTab={1}
          />
        </Paper>
      )}

      {state.loading && (
        <Backdrop
          open={true}
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      {/* スナックバー通知 */}
      {snackbar && (
        <Snackbar
          open={true}
          message={snackbar}
          autoHideDuration={3000}
          onClose={() => setSnackbar(null)}
        />
      )}
    </Box>
  );
}

export default Evm;

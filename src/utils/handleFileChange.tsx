import type {
  AssigneeStatistics,
  Project,
  ProjectStatistics,
} from "evmtools-node/domain";
import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import type { Workbook } from "xlsx-populate";
import { InMemoryRepository } from "../repository/InMemoryRepository";
import { getFilenameWithoutExtension } from "./format";

type HandleFileChangeOptions = {
  file: File;
  resetFileInput?: () => void;
  setLoading: (loading: boolean) => void;
  setStateAfterGeneration: (params: {
    workbook: Workbook;
    path: string;
    statisticsByName: AssigneeStatistics[];
    statisticsByProject: ProjectStatistics[];
  }) => void;
  setProject: (project: Project) => void;
  setSnackbar?: (message: string) => void;
  onError?: (error: unknown) => void;
};

export const handleFileChange = ({
  file,
  resetFileInput,
  setLoading,
  setStateAfterGeneration,
  setProject,
  setSnackbar,
  onError,
}: HandleFileChangeOptions) => {
  if (!file) return;

  resetFileInput?.();
  //   setState((prev) => ({
  //     ...prev,
  //     fileName: file.name,
  //     prevProject: undefined, // ← 前回プロジェクトを削除
  //     // taskDiffs: [], // ← 差分もリセット（あれば）
  //     // projectDiffs: [], // ← 差分結果
  //     // assigneeDiffs: [], // ← 差分結果
  //   }));

  const reader = new FileReader();
  reader.onload = async () => {
    const arrayBuffer = reader.result;
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      console.error("FileReader result is not an ArrayBuffer");
      return;
    }

    setLoading(true);
    // setState((s) => ({ ...s, loading: true }));

    try {
      const projectName = getFilenameWithoutExtension(file.name);

      const creator = new ExcelBufferProjectCreator(arrayBuffer, projectName);
      const repository = new InMemoryRepository({
        onGenerated: ({
          workbook,
          path,
          statisticsByName,
          statisticsByProject,
        }: {
          workbook: Workbook;
          path: string;
          statisticsByName: AssigneeStatistics[];
          statisticsByProject: ProjectStatistics[];
        }) => {
          // 先方で作成が終わったら、教えてもらえる
          setStateAfterGeneration({
            workbook,
            path,
            statisticsByName,
            statisticsByProject,
          });
          //   setState((s) => ({
          //     ...s,
          //     workbook,
          //     path,
          //     statisticsByName,
          //     statisticsByProject,
          //   }));
        },
      });

      const project = await creator.createProject();

      setProject(project);
      setLoading(false);
      //   setState((s) => ({ ...s, project, loading: false }));

      repository.save(project);

      setSnackbar?.(`${file.name} :読み込み完了しました`);
      //   setSnackbar(`${file.name} :読み込み完了しました`);

      console.log("読み込み成功", project.length, " 件");
    } catch (error) {
      console.error("読み込み失敗", error);
      onError?.(error);
      //   setState((s) => ({ ...s, loading: false }));
    } finally {
      setLoading(false);
    }
  };
  reader.readAsArrayBuffer(file);
};

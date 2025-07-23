// utils/handlePrevFileChange.ts
import { ExcelBufferProjectCreator } from "evmtools-node/infrastructure";
import type { Project } from "evmtools-node/domain";
import { getFilenameWithoutExtension } from "../utils/format";

type HandlePrevFileChangeOptions = {
  file: File;
  resetFileInput?: () => void;
  setLoading: (loading: boolean) => void;
  setPrevProject: (project: Project) => void;
  setSnackbar?: (message: string) => void;
  onError?: (error: unknown) => void;
};

export async function handlePrevFileChange({
  file,
  resetFileInput,
  setLoading,
  setPrevProject,
  setSnackbar,
  onError,
}: HandlePrevFileChangeOptions): Promise<void> {
  if (!file) return;

  resetFileInput?.();

  const reader = new FileReader();
  reader.onload = async () => {
    const arrayBuffer = reader.result;
    if (!(arrayBuffer instanceof ArrayBuffer)) return;

    setLoading(true);
    try {
      const projectName = getFilenameWithoutExtension(file.name);
      const creator = new ExcelBufferProjectCreator(arrayBuffer, projectName);
      const prevProject = await creator.createProject();

      setPrevProject(prevProject);
      setSnackbar?.(`${file.name} :前回データの読み込み完了しました`);
    } catch (error) {
      console.error("prev読み込み失敗", error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  reader.readAsArrayBuffer(file);
}

import { dateStr, createStyles } from "evmtools-node/common";
import type {
  ProjectRepository,
  Project,
  ProjectStatistics,
  AssigneeStatistics,
} from "evmtools-node/domain";
import { createWorkbook, json2workbook } from "excel-csv-read-write";
import { getLogger } from "evmtools-node/logger";
import type { Workbook } from "xlsx-populate";

type Props = {
  workbook: Workbook;
  path: string;
  statisticsByName: AssigneeStatistics[];
  statisticsByProject: ProjectStatistics[];
};
export class InMemoryRepository implements ProjectRepository {
  private logger = getLogger("repository/InMemoryRepository");
  private onGenerated?: (props: Props) => void;

  constructor({ onGenerated }: { onGenerated?: (props: Props) => void }) {
    this.onGenerated = onGenerated;
  }

  async save(project: Project): Promise<void> {
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
    statisticsByProject: ProjectStatistics[];
    statisticsByName: AssigneeStatistics[];
    pvByProject: Record<string, unknown>[];
    pvsByProject: Record<string, unknown>[];
    pvByName: Record<string, unknown>[];
    pvsByName: Record<string, unknown>[];
    projectData: Record<string, unknown>[];
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

    this.onGenerated?.({
      workbook,
      path,
      statisticsByName,
      statisticsByProject,
    });

    const dateStrHyphen = dateStr(baseDate).replace(/\//g, "-");

    if (statisticsByProject) {
      this.logger.info("プロジェクト情報");
      console.table(statisticsByProject);
      json2workbook({
        instances: statisticsByProject,
        workbook,
        sheetName: `プロジェクト情報`,
        applyStyles: createStyles(),
      });
    }
    if (statisticsByName) {
      this.logger.info("要員ごと統計");
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
  };
}

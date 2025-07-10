// LongDataByNameTableWrapper.tsx
import type { LongData, Project } from "evmtools-node/domain";
import { LongDataByNameTable } from "./LongDataByNameTable";

type WrapperProps = {
  data: LongData[];
  label?: string;
  data2?: LongData[]; // 未使用
  label2?: string; // 未使用
};

export const createLongDataTableWithProject = (project: Project) => {
  return function LongDataByNameTableWrapper(props: WrapperProps) {
    return <LongDataByNameTable data={props.data} project={project} />;
  };
};

import type { LongData, Project } from "evmtools-node/domain";
import { LongDataByProjectTable } from "./LongDataByProjectTable";

// project を props ではなくクロージャで保持
type WrapperProps = {
  data: LongData[];
  label?: string;
  data2?: LongData[];
  label2?: string;
};

export const createLongDataByProjectTableWithProject = (project: Project) => {
  const WrappedComponent: React.FC<WrapperProps> = ({
    data,
    label,
    data2,
    label2,
  }) => {
    return (
      <LongDataByProjectTable
        data={data}
        label={label}
        data2={data2}
        label2={label2}
        project={project} // クロージャで渡す
      />
    );
  };

  return WrappedComponent;
};

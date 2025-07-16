import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import type { TaskRow, Project } from "evmtools-node/domain";
import { formatNumberIntl, formatFinished } from "../utils/format";
import { dateStr } from "evmtools-node/common";

type Props = {
  open: boolean;
  onClose: () => void;
  task: TaskRow;
  baseDate: Date;
  project: Project;
};

export const TaskDetailDialog = ({
  open,
  onClose,
  task,
  baseDate,
  project,
}: Props) => {




  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>タスク詳細 (ID: {task.id})</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">
          <strong>タスク名:</strong> {task.name}
        </Typography>
        <Typography variant="body1">
          <strong>詳細名:</strong> {project.getFullTaskName(task)}
        </Typography>
        <Typography variant="body1">
          <strong>担当者:</strong> {task.assignee}
        </Typography>
        <Typography variant="body1">
          <strong>工数(MD):</strong> {formatNumberIntl(task.workload)}
        </Typography>
        <Typography variant="body1">
          <strong>進捗率:</strong>{" "}
          {formatNumberIntl(task.progressRate, { style: "percent" })}
        </Typography>
        <Typography variant="body1">
          <strong>完了:</strong> {formatFinished(task.finished)}
        </Typography>
        <Typography variant="body1">
          <strong>開始日:</strong> {dateStr(task.startDate)}
        </Typography>
        <Typography variant="body1">
          <strong>終了日:</strong> {dateStr(task.endDate)}
        </Typography>
        <Typography variant="body1">
          <strong>本日のPV:</strong>{" "}
          {formatNumberIntl(task.calculatePV(baseDate))}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

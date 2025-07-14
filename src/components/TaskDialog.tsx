import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { dateStr } from "evmtools-node/common";
import type { TaskRow, Project } from "evmtools-node/domain";
import { formatDateWithWeekday, formatNumberIntl } from "../utils/format";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedDate?: string;
  selectedAssignee?: string;
  taskRows: TaskRow[];
  project: Project;
  showFullTaskName: boolean;
  onToggleTaskNameDisplay: () => void;
};

export const TaskDialog = ({
  open,
  onClose,
  selectedDate,
  selectedAssignee,
  taskRows,
  project,
  showFullTaskName,
  onToggleTaskNameDisplay,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div>
          {selectedDate ? (
            <>
              {`${formatDateWithWeekday(selectedDate)} の${
                selectedAssignee ? ` ${selectedAssignee} の` : ""
              }タスク`}
              <Typography variant="caption" sx={{ display: "block" }}>
                （「タスク名」をヘッダやデータのクリックで、詳細名に切り替えます）
              </Typography>
            </>
          ) : (
            "稼働情報"
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {taskRows.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell
                  onClick={onToggleTaskNameDisplay}
                  sx={{ cursor: "pointer", minWidth: 100 }}
                >
                  タスク名
                </TableCell>
                <TableCell sx={{ minWidth: 30 }}>担当者</TableCell>
                <TableCell>工数(MD)</TableCell>
                <TableCell>日数(日)</TableCell>
                <TableCell align="right">本日のPV</TableCell>
                <TableCell>予定開始日</TableCell>
                <TableCell>予定終了日</TableCell>
                <TableCell>進捗率(%)</TableCell>
                <TableCell align="right" sx={{ minWidth: 100 }}>
                  PV/EV/SPI
                </TableCell>
                {/* <TableCell align="right">未完了/完了</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {taskRows.map((task, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    backgroundColor: task.finished
                      ? "#f0f0f0"
                      : // : task.isOverdueAt(new Date(selectedDate!))
                        // ? "#ffebee"
                        undefined,
                  }}
                >
                  <TableCell>{task.id}</TableCell>
                  <TableCell
                    onClick={onToggleTaskNameDisplay}
                    sx={{ cursor: "pointer" }}
                  >
                    {showFullTaskName
                      ? project.getFullTaskName(task)
                      : task.name}
                  </TableCell>
                  <TableCell>{task.assignee}</TableCell>

                  <TableCell align="right">
                    {formatNumberIntl(task.workload, {
                      maximumFractionDigits: 3,
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumberIntl(task.scheduledWorkDays, {
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>

                  <TableCell align="right">
                    {formatNumberIntl(
                      task.calculatePV(new Date(selectedDate!)),
                      { maximumFractionDigits: 3 }
                    )}
                  </TableCell>
                  <TableCell>{dateStr(task.startDate)}</TableCell>
                  <TableCell>{dateStr(task.endDate)}</TableCell>
                  <TableCell align="right">
                    {formatNumberIntl(task.progressRate, {
                      style: "percent",
                      maximumFractionDigits: 1,
                    })}
                  </TableCell>

                  <TableCell align="right">
                    {formatNumberIntl(task.pv, { maximumFractionDigits: 2 })} /{" "}
                    {formatNumberIntl(task.ev, { maximumFractionDigits: 2 })} /{" "}
                    {formatNumberIntl(task.spi, { maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* <TableCell>{formatFinished(task.finished)}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>稼働タスクはありません。</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

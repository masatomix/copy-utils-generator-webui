import {
  Typography,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from "@mui/material";
import { type TaskDiff, Project, ProjectService } from "evmtools-node/domain";
import { formatNumberIntl } from "../../utils/format";
import { dateStr } from "evmtools-node/common";
import { ShowDiffTag } from "./ShowDiffTag";

export const AssigneeDiffTable = ({
  data,
  current,
  prev,
}: {
  data: TaskDiff[];
  current: Project;
  prev: Project;
}) => {
  const filtered = data.filter((d) => d.hasDiff);
  const grouped = new ProjectService().calculateAssigneeDiffs(filtered);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1} mb={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
          <Typography variant="body2" mt={1}>
              進捗率、PV、EVに変更があったタスクの担当単位での集計値です。
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>作業予定タスクのPV合計:</strong>
              担当者が予定していたタスクたちの「基準日の」PV合計。カッコ内はそのタスクたちの「比較対象日までの累積PV→基準日までの累積PV」を表示
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>進捗したタスクのEV合計:</strong>
              基準日に進捗したタスク達のEV合計。カッコ内はそのタスクたちの「比較対象日までの累積EV→基準日までの累積EV」を表示
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>基準日:</strong> {dateStr(current.baseDate)} ／{" "}
              <strong>比較対象:</strong> {dateStr(prev.baseDate)}{" "}
              <strong>(処理対象 {filtered.length} 件)</strong>
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>担当</TableCell>
              <TableCell>作業予定タスクのPV合計</TableCell>
              <TableCell>進捗したタスクのEV合計</TableCell>
              <TableCell>変更</TableCell>
              <TableCell>追加</TableCell>
              <TableCell>削除</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grouped.map((diff) => (
              <TableRow key={diff.assignee}>
                <TableCell>{diff.assignee}</TableCell>
                <TableCell>
                  {formatNumberIntl(diff.deltaPV, { maximumFractionDigits: 3 })}
                  <ShowDiffTag
                    current={diff.currentPV}
                    prev={diff.prevPV}
                    show={true}
                  />
                </TableCell>
                <TableCell>
                  {formatNumberIntl(diff.deltaEV, { maximumFractionDigits: 3 })}
                  <ShowDiffTag
                    current={diff.currentEV}
                    prev={diff.prevEV}
                    show={true}
                  />
                </TableCell>
                <TableCell>{diff.modifiedCount}</TableCell>
                <TableCell>{diff.addedCount}</TableCell>
                <TableCell>{diff.removedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

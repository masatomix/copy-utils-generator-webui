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
import { formatNumberIntl } from "../utils/format";
import { dateStr } from "evmtools-node/common";

export const ProjectDiffSummary = ({
  data,
  current,
  prev,
}: {
  data: TaskDiff[];
  current: Project;
  prev: Project;
}) => {
  const grouped = new ProjectService().calculateProjectDiffs(
    data.filter((d) => d.hasDiff)
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1} mb={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <Typography gutterBottom>
              進捗率、PV、EVに変更があったタスクのプロジェクト単位での集計値です。
            </Typography>
            <Typography variant="body2" mt={1}>
              <strong>基準日:</strong> {dateStr(current.baseDate)} ／{" "}
              <strong>比較対象:</strong> {dateStr(prev.baseDate)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>PV (今)</TableCell>
              <TableCell>PV (前)</TableCell>
              <TableCell>差分</TableCell>
              <TableCell>EV (今)</TableCell>
              <TableCell>EV (前)</TableCell>
              <TableCell>差分</TableCell>
              <TableCell>変更</TableCell>
              <TableCell>追加</TableCell>
              <TableCell>削除</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grouped.map((diff) => (
              <TableRow>
                <TableCell>{formatNumberIntl(diff.currentPV)}</TableCell>
                <TableCell>{formatNumberIntl(diff.prevPV)}</TableCell>
                <TableCell>{formatNumberIntl(diff.deltaPV)}</TableCell>
                <TableCell>{formatNumberIntl(diff.currentEV)}</TableCell>
                <TableCell>{formatNumberIntl(diff.prevEV)}</TableCell>
                <TableCell>{formatNumberIntl(diff.deltaEV)}</TableCell>
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

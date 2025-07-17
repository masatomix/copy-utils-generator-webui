import { TableFooter, TableRow, TableCell } from "@mui/material";
import type { TaskRow } from "evmtools-node/domain";
import { useMemo } from "react";
import { formatNumberIntl } from "../utils/format";

export const TaskRowsFooter = ({
  taskRows,
  baseDate,
}: {
  taskRows: TaskRow[];
  baseDate: Date;
}) => {
  const totals = useMemo(() => {
    const workload = taskRows.reduce((sum, t) => sum + (t.workload ?? 0), 0);
    const pv = taskRows.reduce(
      (sum, t) => sum + (t.calculatePVs(baseDate) ?? 0),
      0
    );
    const ev = taskRows.reduce((sum, t) => sum + (t.ev ?? 0), 0);
    const spi = pv !== 0 ? ev / pv : NaN;
    const sv = pv !== 0 ? ev - pv : NaN;
    const progressRate = workload !== 0 ? ev / workload : NaN;
    return {
      taskCount: taskRows.length,
      workload,
      pvToday: taskRows.reduce(
        (sum, t) => sum + (t.calculatePV(new Date(baseDate)) ?? 0),
        0
      ),
      progressRate,
      pv,
      ev,
      spi,
      sv,
    };
  }, [taskRows, baseDate]);
  return (
    <TableFooter>
      <TableRow>
        <TableCell align="right">計</TableCell>
        <TableCell>{totals.taskCount} タスク</TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right">
          {formatNumberIntl(totals.workload, {
            maximumFractionDigits: 2,
          })}
        </TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right">
          {formatNumberIntl(totals.pvToday, {
            maximumFractionDigits: 2,
          })}
        </TableCell>
        <TableCell colSpan={2}></TableCell>
        <TableCell align="right">
          {formatNumberIntl(totals.progressRate, {
            style: "percent",
            maximumFractionDigits: 1,
          })}
        </TableCell>
        <TableCell></TableCell>
        <TableCell align="right">
          {formatNumberIntl(totals.pv, { maximumFractionDigits: 2 })} /{" "}
          {formatNumberIntl(totals.ev, { maximumFractionDigits: 2 })} /{" "}
          {formatNumberIntl(totals.spi, { maximumFractionDigits: 2 })} /{" "}
          {formatNumberIntl(totals.sv, { maximumFractionDigits: 2 })}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

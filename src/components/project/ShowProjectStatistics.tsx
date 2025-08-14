import { TableCell, TableRow } from "@mui/material";
import { subtract } from "evmtools-node/common";
import type { ProjectStatistics } from "evmtools-node/domain";
import { formatNumberIntl } from "../../utils/format";

export const ShowProjectStatistics = ({
  row,
  idx,
  detail = false,
}: {
  row: ProjectStatistics;
  idx: number;
  detail?: boolean;
}) => {
  const sv = subtract(row.totalEv, row.totalPvCalculated);
  const svColor = sv! < 0 ? "error.main" : "inherit"; // svでも、spiで判定してもほぼ同じ

  return (
    <TableRow
      // key={idx}
      sx={{
        backgroundColor: idx % 2 === 0 ? "#fafafa" : "white",
      }}
    >
      <TableCell>{row.projectName ?? "-"}</TableCell>
      <TableCell align="right">{row.startDate}</TableCell>
      <TableCell align="right">{row.endDate}</TableCell>
      <TableCell align="right">{row.totalTasksCount ?? "-"}</TableCell>
      {detail && (
        <TableCell align="right">{row.totalWorkloadExcel ?? "-"}</TableCell>
      )}
      <TableCell align="right">{row.totalWorkloadCalculated ?? "-"}</TableCell>
      <TableCell align="right">
        {formatNumberIntl(row.averageWorkload, {
          maximumFractionDigits: 3,
        })}
      </TableCell>
      <TableCell align="right">{row.baseDate}</TableCell>
      {detail && (
        <TableCell align="right">
          {formatNumberIntl(row.totalPvExcel, {
            maximumFractionDigits: 3,
          })}
        </TableCell>
      )}
      <TableCell align="right">
        {formatNumberIntl(row.totalPvCalculated, {
          maximumFractionDigits: 3,
        })}
      </TableCell>
      <TableCell align="right">
        {formatNumberIntl(row.totalEv, {
          maximumFractionDigits: 3,
        })}
      </TableCell>
      <TableCell align="right" component="span" sx={{ color: svColor }}>
        {formatNumberIntl(sv, {
          maximumFractionDigits: 3,
        })}
      </TableCell>
      <TableCell align="right" component="span" sx={{ color: svColor }}>
        {formatNumberIntl(row.spi, {
          maximumFractionDigits: 3,
        })}
      </TableCell>
    </TableRow>
  );
};

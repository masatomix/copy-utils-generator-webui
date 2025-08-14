import { Box, TableCell } from "@mui/material";
import { formatNumberIntl } from "../../utils/format";
import type { TaskRow } from "evmtools-node/domain";

export const PVEVSPI = ({
  taskRow,
  baseDate,
}: {
  taskRow: TaskRow;
  baseDate: Date;
}) => {
  const pv = taskRow.calculatePVs(baseDate);
  const ev = taskRow.ev;
  const spi = taskRow.calculateSPI(baseDate);
  const sv = taskRow.calculateSV(baseDate);

  const svColor = sv! < 0 ? "error.main" : "inherit"; // svでも、spiで判定してもほぼ同じ

  return (
    <TableCell align="right">
      {formatNumberIntl(pv, {
        maximumFractionDigits: 2,
      })}{" "}
      / {formatNumberIntl(ev, { maximumFractionDigits: 2 })} /{" "}
      <Box component="span" sx={{ color: svColor }}>
        {formatNumberIntl(spi, {
          maximumFractionDigits: 2,
        })}
      </Box>{" "}
      /{" "}
      <Box component="span" sx={{ color: svColor }}>
        {formatNumberIntl(sv, {
          maximumFractionDigits: 2,
        })}
      </Box>
    </TableCell>
  );
};

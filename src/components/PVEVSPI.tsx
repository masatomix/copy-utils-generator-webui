import { TableCell } from "@mui/material";
import { formatNumberIntl } from "../utils/format";
import type { TaskRow } from "evmtools-node/domain";

export const PVEVSPI = ({
  taskRow,
  baseDate,
}: {
  taskRow: TaskRow;
  baseDate: Date;
}) => {
  return (
    <TableCell align="right">
      {formatNumberIntl(taskRow.calculatePVs(baseDate), {
        maximumFractionDigits: 2,
      })}{" "}
      / {formatNumberIntl(taskRow.ev, { maximumFractionDigits: 2 })} /{" "}
      {formatNumberIntl(taskRow.spi, { maximumFractionDigits: 2 })}
    </TableCell>
  );
};

import { TableFooter, TableRow, TableCell, Box, Tooltip } from "@mui/material";
import type { TaskDiff } from "evmtools-node/domain";
import { useMemo } from "react";
import { formatNumberIntl } from "../../utils/format";
import { ShowDiffTag } from "./ShowDiffTag";
import { subtract } from "evmtools-node/common";

export const TaskDiffFooter = ({
  filtered,
  showActualValues,
}: {
  filtered: TaskDiff[];
  showActualValues: boolean;
}) => {
  const totals = useMemo(() => {
    const pvDiffs = filtered.filter((diff) => diff.hasPvDiff);
    const deltaPV = pvDiffs.reduce((sum, t) => sum + (t.deltaPV ?? 0), 0);
    const currentPV = pvDiffs.reduce((sum, t) => sum + (t.currentPV ?? 0), 0);
    const prevPV = pvDiffs.reduce((sum, t) => sum + (t.prevPV ?? 0), 0);

    const evDiffs = filtered.filter((diff) => diff.hasEvDiff);
    const deltaEV = evDiffs.reduce((sum, t) => sum + (t.deltaEV ?? 0), 0);
    const currentEV = evDiffs.reduce((sum, t) => sum + (t.currentEV ?? 0), 0);
    const prevEV = evDiffs.reduce((sum, t) => sum + (t.prevEV ?? 0), 0);

    return {
      deltaPV,
      currentPV,
      prevPV,
      deltaEV,
      currentEV,
      prevEV,
    };
  }, [filtered]);

  const sv = subtract(totals.deltaEV, totals.deltaPV);
  const svColor = sv! < 0 ? "error.main" : "inherit"; // svでも、spiで判定してもほぼ同じ
  const pvColor = totals.deltaPV! < 0 ? "error.main" : "inherit"; // pvがマイナス値は、リスケと判断

  return (
    <TableFooter>
      <TableRow>
        <TableCell>計</TableCell>
        <TableCell>{filtered.length}件</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>

        <Tooltip
          title={
            <>
              マイナス値は太字の赤で表示
              <br />
              (リスケタスクの可能性があるため)
            </>
          }
          placement="top"
        >
          <TableCell>
            <Box
              component="span"
              sx={{
                color: pvColor,
                fontWeight: pvColor === "error.main" ? "bold" : "normal",
              }}
            >
              {formatNumberIntl(totals.deltaPV, {
                maximumFractionDigits: 3,
              })}
            </Box>
            <ShowDiffTag
              current={totals.currentPV}
              prev={totals.prevPV}
              show={showActualValues}
            />
          </TableCell>
        </Tooltip>
        <Tooltip title="PVよりEVが小さい場合赤字" placement="top">
          <TableCell>
            <Box component="span" sx={{ color: svColor }}>
              {formatNumberIntl(totals.deltaEV, { maximumFractionDigits: 3 })}
            </Box>
            <ShowDiffTag
              current={totals.currentEV}
              prev={totals.prevEV}
              show={showActualValues}
            />
          </TableCell>
        </Tooltip>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
      </TableRow>
    </TableFooter>
  );
};

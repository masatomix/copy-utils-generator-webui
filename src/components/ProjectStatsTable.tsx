import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import type { ProjectStatistics } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";
import { HelpPopover } from "../pages/Evm";

type Props = {
  data: ProjectStatistics[];
  detail?: boolean;
};

export const ProjectStatsTable = ({ data, detail = false }: Props) => {

  const ShowRowData = ({
    row,
    idx,
  }: {
    row: ProjectStatistics;
    idx: number;
  }) => {

    const sv = subtract(row.totalEv, row.totalPvCalculated);
    const svColor = sv! < 0 ? "error.main" : "inherit"; // svでも、spiで判定してもほぼ同じ

    return (
      <TableRow
        key={idx}
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
        <TableCell align="right">
          {row.totalWorkloadCalculated ?? "-"}
        </TableCell>
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

  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 4, borderRadius: 2, boxShadow: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell sx={{ fontWeight: "bold" }}>プロジェクト名</TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              開始予定日
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              終了予定日
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              タスク数
            </TableCell>
            {detail && (
              <>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  工数合計(Excel)
                  <HelpPopover title="Excel上の予定工数の合計値" content="" />
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  工数合計(計算)
                  <HelpPopover
                    title="メインタブの工数合計とおなじ"
                    content=""
                  />
                </TableCell>
              </>
            )}
            {!detail && (
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                工数合計
              </TableCell>
            )}
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              工数平均
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              基準日
            </TableCell>
            {detail && (
              <>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  基準日終了時PV累積(Excel)
                  <HelpPopover title="Excelファイル上のPVの合計値" content="" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  基準日終了時PV累積(計算){" "}
                  <HelpPopover title="メインタブのPVとおなじ" content="" />
                </TableCell>
              </>
            )}
            {!detail && (
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                PV
              </TableCell>
            )}
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              EV
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              EV-PV
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              SPI
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <ShowRowData row={row} idx={idx}></ShowRowData>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function subtract(
  a: number | undefined,
  b: number | undefined
): number | undefined {
  if (typeof a !== "number" || typeof b !== "number") {
    return undefined;
  }
  return a - b;
}

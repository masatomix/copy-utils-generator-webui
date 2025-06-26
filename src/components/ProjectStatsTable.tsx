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

type Props = {
  data: ProjectStatistics[];
  detail?: boolean;
};

export const ProjectStatsTable = ({ data, detail = false }: Props) => {
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
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  工数合計(計算)
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
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  基準日終了時PV累積(計算)
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
            <TableRow
              key={idx}
              sx={{
                backgroundColor: idx % 2 === 0 ? "#fafafa" : "white",
              }}
            >
              <TableCell>{row.プロジェクト名 ?? "-"}</TableCell>
              <TableCell align="right">{row.開始予定日}</TableCell>
              <TableCell align="right">{row.終了予定日}</TableCell>
              <TableCell align="right">{row.全体タスク数 ?? "-"}</TableCell>
              {detail && (
                <TableCell align="right">
                  {row["全体工数の和(Excel)"] ?? "-"}
                </TableCell>
              )}
              <TableCell align="right">
                {row["全体工数の和(計算)"] ?? "-"}
              </TableCell>
              <TableCell align="right">
                {formatNumberIntl(row["全体工数平均"], {
                  maximumFractionDigits: 3,
                })}
              </TableCell>
              <TableCell align="right">{row.基準日}</TableCell>
              {detail && (
                <TableCell align="right">
                  {formatNumberIntl(row["基準日終了時PV累積(Excel)"], {
                    maximumFractionDigits: 3,
                  })}
                </TableCell>
              )}
              <TableCell align="right">
                {formatNumberIntl(row["基準日終了時PV累積(計算)"], {
                  maximumFractionDigits: 3,
                })}
              </TableCell>
              <TableCell align="right">
                {formatNumberIntl(row["基準日終了時EV累積"], {
                  maximumFractionDigits: 3,
                })}
              </TableCell>
              <TableCell align="right">
                {formatNumberIntl(
                  subtract(
                    row["基準日終了時EV累積"],
                    row["基準日終了時PV累積(計算)"]
                  ),
                  {
                    maximumFractionDigits: 3,
                  }
                )}
              </TableCell>
              <TableCell align="right">
                {formatNumberIntl(row["基準日終了時SPI"], {
                  maximumFractionDigits: 3,
                })}
              </TableCell>
            </TableRow>
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

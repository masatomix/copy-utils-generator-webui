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
import { HelpPopover } from "../pages/Evm";
import { ShowProjectStatistics } from "./ShowProjectStatistics";

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
            <ShowProjectStatistics
              row={row}
              idx={idx}
              detail={detail}
            ></ShowProjectStatistics>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

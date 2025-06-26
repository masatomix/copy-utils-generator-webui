import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { useState } from "react";
import type { AssigneeStatistics } from "evmtools-node/domain";
import { formatNumberIntl } from "../utils/format";

type Order = "asc" | "desc";

type Props = {
  data: AssigneeStatistics[];
  detail?: boolean;
};

export const AssigneeStatsTable = ({ data, detail = false }: Props) => {
  // AssigneeStatistics のキーは string リテラルでなくても良いので
  // 「assignee」などでソートできるようにするため型は文字列で管理
  const [orderBy, setOrderBy] = useState<keyof AssigneeStatistics | "assignee">(
    "assignee"
  );
  const [order, setOrder] = useState<Order>("asc");

  const handleSort = (key: keyof AssigneeStatistics | "assignee") => {
    const isAsc = orderBy === key && order === "asc";
    setOrderBy(key);
    setOrder(isAsc ? "desc" : "asc");
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[orderBy as keyof AssigneeStatistics];
    const bVal = b[orderBy as keyof AssigneeStatistics];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    return order === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 4, borderRadius: 2, boxShadow: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell sx={{ fontWeight: "bold" }}>
              <TableSortLabel
                active={orderBy === "assignee"}
                direction={orderBy === "assignee" ? order : "asc"}
                onClick={() => handleSort("assignee")}
              >
                担当者
              </TableSortLabel>
            </TableCell>

            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              <TableSortLabel
                active={orderBy === "totalTasksCount"}
                direction={orderBy === "totalTasksCount" ? order : "asc"}
                onClick={() => handleSort("totalTasksCount")}
              >
                タスク数
              </TableSortLabel>
            </TableCell>

            {detail && (
              <>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "totalWorkloadExcel"}
                    direction={orderBy === "totalWorkloadExcel" ? order : "asc"}
                    onClick={() => handleSort("totalWorkloadExcel")}
                  >
                    工数合計(Excel)
                  </TableSortLabel>
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "totalWorkloadCalculated"}
                    direction={
                      orderBy === "totalWorkloadCalculated" ? order : "asc"
                    }
                    onClick={() => handleSort("totalWorkloadCalculated")}
                  >
                    工数合計(計算)
                  </TableSortLabel>
                </TableCell>
              </>
            )}

            {!detail && (
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === "totalWorkloadCalculated"}
                  direction={
                    orderBy === "totalWorkloadCalculated" ? order : "asc"
                  }
                  onClick={() => handleSort("totalWorkloadCalculated")}
                >
                  工数合計
                </TableSortLabel>
              </TableCell>
            )}

            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              <TableSortLabel
                active={orderBy === "averageWorkload"}
                direction={orderBy === "averageWorkload" ? order : "asc"}
                onClick={() => handleSort("averageWorkload")}
              >
                工数平均
              </TableSortLabel>
            </TableCell>

            <TableCell sx={{ fontWeight: "bold" }}>
              <TableSortLabel
                active={orderBy === "baseDate"}
                direction={orderBy === "baseDate" ? order : "asc"}
                onClick={() => handleSort("baseDate")}
              >
                基準日
              </TableSortLabel>
            </TableCell>

            {detail && (
              <>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "totalPvExcel"}
                    direction={orderBy === "totalPvExcel" ? order : "asc"}
                    onClick={() => handleSort("totalPvExcel")}
                  >
                    基準日終了時PV累積(Excel)
                  </TableSortLabel>
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  <TableSortLabel
                    active={orderBy === "totalPvCalculated"}
                    direction={orderBy === "totalPvCalculated" ? order : "asc"}
                    onClick={() => handleSort("totalPvCalculated")}
                  >
                    基準日終了時PV累積(計算)
                  </TableSortLabel>
                </TableCell>
              </>
            )}

            {!detail && (
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === "totalPvCalculated"}
                  direction={orderBy === "totalPvCalculated" ? order : "asc"}
                  onClick={() => handleSort("totalPvCalculated")}
                >
                  PV
                </TableSortLabel>
              </TableCell>
            )}

            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              <TableSortLabel
                active={orderBy === "totalEv"}
                direction={orderBy === "totalEv" ? order : "asc"}
                onClick={() => handleSort("totalEv")}
              >
                EV
              </TableSortLabel>
            </TableCell>

            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              <TableSortLabel
                active={orderBy === "spi"}
                direction={orderBy === "spi" ? order : "asc"}
                onClick={() => handleSort("spi")}
              >
                SPI
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedData.map((row, idx) => (
            <TableRow
              key={idx}
              sx={{ backgroundColor: idx % 2 === 0 ? "#fafafa" : "white" }}
            >
              <TableCell>{row.assignee ?? "-"}</TableCell>
              <TableCell align="right">{row.totalTasksCount ?? "-"}</TableCell>

              {detail && (
                <>
                  <TableCell align="right">
                    {row.totalWorkloadExcel ?? "-"}
                  </TableCell>
                  <TableCell align="right">
                    {row.totalWorkloadCalculated ?? "-"}
                  </TableCell>
                </>
              )}

              {!detail && (
                <TableCell align="right">
                  {row.totalWorkloadCalculated ?? "-"}
                </TableCell>
              )}

              <TableCell align="right">
                {formatNumberIntl(row.averageWorkload, {
                  maximumFractionDigits: 3,
                })}
              </TableCell>
              <TableCell>{row.baseDate ?? "-"}</TableCell>

              {detail && (
                <>
                  <TableCell align="right">
                    {formatNumberIntl(row.totalPvExcel, {
                      maximumFractionDigits: 3,
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumberIntl(row.totalPvCalculated, {
                      maximumFractionDigits: 3,
                    })}
                  </TableCell>
                </>
              )}

              {!detail && (
                <TableCell align="right">
                  {formatNumberIntl(row.totalPvCalculated, {
                    maximumFractionDigits: 3,
                  })}
                </TableCell>
              )}

              <TableCell align="right">
                {formatNumberIntl(row.totalEv, { maximumFractionDigits: 3 })}
              </TableCell>
              <TableCell align="right">
                {formatNumberIntl(row.spi, { maximumFractionDigits: 3 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

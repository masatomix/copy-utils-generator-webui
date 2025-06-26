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
type SortKey = keyof AssigneeStatistics;

type Props = {
  data: AssigneeStatistics[];
  detail?: boolean;
};

export const AssigneeStatsTable = ({ data, detail = false }: Props) => {
  const [orderBy, setOrderBy] = useState<SortKey>("assignee");
  const [order, setOrder] = useState<Order>("asc");

  const columns: { key: SortKey; label: string; isNumeric?: boolean }[] = [
    { key: "assignee", label: "担当者" },
    { key: "全体タスク数", label: "タスク数", isNumeric: true },
    ...(detail
      ? [
          {
            key: "全体工数の和(Excel)",
            label: "工数合計(Excel)",
            isNumeric: true,
          },
          {
            key: "全体工数の和(計算)",
            label: "工数合計(計算)",
            isNumeric: true,
          },
        ]
      : [{ key: "全体工数の和(計算)", label: "工数合計", isNumeric: true }]),
    { key: "全体工数平均", label: "工数平均", isNumeric: true },
    { key: "基準日", label: "基準日" },
    ...(detail
      ? [
          {
            key: "基準日終了時PV累積(Excel)",
            label: "基準日終了時PV累積(Excel)",
            isNumeric: true,
          },
          {
            key: "基準日終了時PV累積(計算)",
            label: "基準日終了時PV累積(計算)",
            isNumeric: true,
          },
        ]
      : [
          {
            key: "基準日終了時PV累積(計算)",
            label: "PV",
            isNumeric: true,
          },
        ]),
    {
      key: "基準日終了時EV累積",
      label: "EV",
      isNumeric: true,
    },
    {
      key: "基準日終了時SPI",
      label: "SPI",
      isNumeric: true,
    },
  ];

  const handleSort = (key: SortKey) => {
    const isAsc = orderBy === key && order === "asc";
    setOrderBy(key);
    setOrder(isAsc ? "desc" : "asc");
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];

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
            {columns.map(({ key, label, isNumeric }) => (
              <TableCell
                key={key as string}
                align={isNumeric ? "right" : "left"}
                sortDirection={orderBy === key ? order : false}
                sx={{ fontWeight: "bold" }}
              >
                <TableSortLabel
                  active={orderBy === key}
                  direction={orderBy === key ? order : "asc"}
                  onClick={() => handleSort(key)}
                >
                  {label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, idx) => (
            <TableRow
              key={idx}
              sx={{
                backgroundColor: idx % 2 === 0 ? "#fafafa" : "white",
              }}
            >
              {columns.map(({ key, isNumeric }) => (
                <TableCell
                  key={key as string}
                  align={isNumeric ? "right" : "left"}
                >
                  {typeof row[key] === "number"
                    ? formatNumberIntl(row[key] as number, {
                        maximumFractionDigits: 3,
                      })
                    : row[key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

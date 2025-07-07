import type { DiffType } from "evmtools-node/domain";

export const formatPercentIntl = (
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }
): string => {
  if (value == null || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("ja-JP", options).format(num);
};

export const formatNumberIntl = (
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }
): string => {
  if (value == null || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("ja-JP", options).format(num);
};

export const formatDateWithWeekday = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short", // → "(水)"など
  }).format(date);
};

export const formatDiffType = (diffType: DiffType): string => {
  switch (diffType) {
    case "modified":
      return "変更";
    case "added":
      return "追加";
    case "removed":
      return "削除";
    case "none":
      return "変化なし";
    default:
      return diffType;
  }
};

export const formatFinished = (finished: boolean): string =>
  finished ? "完了" : "未完了";

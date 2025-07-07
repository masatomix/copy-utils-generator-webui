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

export const formatDiffType = (
  diffType: DiffType | undefined | null
): string => {
  if (diffType == null) return "-";

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

export const formatFinished = (finished: boolean | undefined | null): string =>
  finished == null ? "-" : finished ? "完了" : "未完了";

export const formatIsOverdueAt = (
  isOverdueAt: boolean | undefined | null
): string => (isOverdueAt == null ? "-" : isOverdueAt ? "期限切れ" : "期限前");

/**
 * baseDate(基準日) に比べて targetDate(おもに期限) が何日後かを計算して返す
 * base 2025/07/19 target 2025/07/18 => -1
 * @param baseDate
 * @param targetDate
 * @param locale
 * @returns
 */
export const formatRelativeDaysNumber = (
  baseDate: Date | string | null | undefined,
  targetDate: Date | string | null | undefined
): number | null => {
  if (!baseDate || !targetDate) return null;

  const base = new Date(baseDate);
  const target = new Date(targetDate);

  const diffMs = target.getTime() - base.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * baseDate(基準日) に比べて targetDate(おもに期限) が何日後かを計算して返す
 * (文字列で)
 * base 2025/07/19 target 2025/07/18 => -1
 * @param baseDate
 * @param targetDate
 * @param locale
 * @returns
 */
export const formatRelativeDays = (
  baseDate: Date | string | null | undefined,
  targetDate: Date | string | null | undefined,
  locale: string = "ja"
): string | null => {
  const diffDays = formatRelativeDaysNumber(baseDate, targetDate);
  if (diffDays == null) return null;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return rtf.format(diffDays, "day"); // "in 3 days" → "3日後"
};

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

import React from "react";
import { formatNumberIntl } from "../utils/format";

type Props = {
  show: boolean;
  prev: number | undefined | null;
  current: number | undefined | null;
  style?: "decimal" | "percent" | "currency";
  maximumFractionDigits?: number;
};

export const ShowDiffTag: React.FC<Props> = ({
  show,
  prev,
  current,
  style = "decimal",
  maximumFractionDigits = 3,
}) => {
  if (!show) return null;

  return (
    <>
      &nbsp;(
      {formatNumberIntl(prev, {
        style,
        maximumFractionDigits,
      })}
      &nbsp;→&nbsp;
      {formatNumberIntl(current, {
        style,
        maximumFractionDigits,
      })}
      )
    </>
  );
};

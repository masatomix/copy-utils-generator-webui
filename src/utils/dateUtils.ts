import type { Project } from "evmtools-node/domain";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isHoliday(dateString: string, _project?: Project): boolean {
  // 将来的に、Projectから休日データをもらって、その内容も反映させたい
  const date = new Date(dateString);
  const day = date.getDay(); // 0: 日, 6: 土
  return day === 0 || day === 6;
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const target = new Date(dateString);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

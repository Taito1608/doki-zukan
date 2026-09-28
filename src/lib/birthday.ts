import { MESSAGE_WINDOW_DAYS } from "./constants";

const DAY_MS = 24 * 60 * 60 * 1000;

export type YMD = { year: number; month: number; day: number };

/** 日本時間での「今日」 */
export function todayJST(now: Date = new Date()): YMD {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** その年の誕生日（2/29生まれは平年なら2/28として扱う） */
function occurrence(year: number, month: number, day: number): number {
  const d = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  return Date.UTC(year, month - 1, d);
}

function toUTC(ymd: YMD) {
  return Date.UTC(ymd.year, ymd.month - 1, ymd.day);
}

/** 次の誕生日まで何日か（今日なら0） */
export function daysUntilBirthday(month: number, day: number, today: YMD = todayJST()): number {
  const t = toUTC(today);
  let occ = occurrence(today.year, month, day);
  if (occ < t) occ = occurrence(today.year + 1, month, day);
  return Math.round((occ - t) / DAY_MS);
}

export function isBirthdayToday(month: number | null, day: number | null, today: YMD = todayJST()) {
  if (month == null || day == null) return false;
  return daysUntilBirthday(month, day, today) === 0;
}

/**
 * 寄せ書きの対象になる誕生日の年と、今日との差（日数）を返す。
 * 誕生日の前後 MESSAGE_WINDOW_DAYS 日以内なら canWrite = true。
 */
export function messageTarget(month: number, day: number, today: YMD = todayJST()) {
  const t = toUTC(today);
  let best = { year: today.year, diff: Number.POSITIVE_INFINITY };
  for (const y of [today.year - 1, today.year, today.year + 1]) {
    const diff = Math.round((occurrence(y, month, day) - t) / DAY_MS);
    if (Math.abs(diff) < Math.abs(best.diff)) best = { year: y, diff };
  }
  return {
    year: best.year,
    /** 正なら誕生日まであと◯日、負なら◯日前が誕生日 */
    diff: best.diff,
    canWrite: Math.abs(best.diff) <= MESSAGE_WINDOW_DAYS,
  };
}

export function formatBirthday(month: number | null, day: number | null) {
  if (month == null || day == null) return null;
  return `${month}月${day}日`;
}

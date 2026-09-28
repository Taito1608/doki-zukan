import type { Profile } from "./types";
import type { IconName } from "@/components/Icon";
import { MAX_HOBBIES, MAX_HOBBY_LENGTH } from "./constants";

/** 趣味タグの表記ゆれを吸収する（前後空白・全角英数・大文字小文字） */
export function normalizeHobby(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .replace(/^#/, "")
    .slice(0, MAX_HOBBY_LENGTH);
}

function hobbyKey(h: string) {
  return normalizeHobby(h).toLowerCase();
}

export function cleanHobbies(list: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of list) {
    const h = normalizeHobby(raw);
    const key = h.toLowerCase();
    if (!h || seen.has(key)) continue;
    seen.add(key);
    result.push(h);
    if (result.length >= MAX_HOBBIES) break;
  }
  return result;
}

export type CommonPoint = { icon: IconName; label: string };

/** 2人のプロフィールから共通点を抜き出す */
export function findCommonPoints(me: Profile, other: Profile): CommonPoint[] {
  if (me.id === other.id) return [];
  const points: CommonPoint[] = [];

  if (me.hometown && me.hometown === other.hometown) {
    points.push({ icon: "pin", label: me.hometown === "海外" ? "海外出身" : `${me.hometown}出身` });
  }

  const myHobbies = new Set(me.hobbies.map(hobbyKey));
  for (const h of other.hobbies) {
    if (myHobbies.has(hobbyKey(h))) points.push({ icon: "heart", label: `${h}好き` });
  }

  if (me.birth_month != null && me.birth_month === other.birth_month) {
    if (me.birth_day === other.birth_day) {
      points.push({ icon: "cake", label: `誕生日が同じ（${me.birth_month}月${me.birth_day}日）` });
    } else {
      points.push({ icon: "cake", label: `同じ${me.birth_month}月生まれ` });
    }
  }

  if (me.department && me.department === other.department) {
    points.push({ icon: "building", label: `配属（希望）が同じ：${me.department}` });
  }

  if (me.job_type && me.job_type === other.job_type && me.job_type !== "その他") {
    points.push({ icon: "briefcase", label: `同じ${me.job_type}` });
  }

  return points;
}

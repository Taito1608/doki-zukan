import { daysUntilBirthday, type YMD } from "./birthday";

// 誕生日の通知で「誰に・何を」送るかを決める（送信そのものは行わない）

type Person = { id: string; display_name: string; birth_month: number | null; birth_day: number | null };
type Message = { from_user_id: string; to_user_id: string; year: number };

export type PlannedNotification = { userId: string; title: string; body: string; url: string; tag: string };

function namesOf(people: Person[]) {
  const names = people.map((p) => `${p.display_name}さん`);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join("、")}と${names[names.length - 1]}`;
}

/** 1人なら寄せ書きページ、複数ならホーム（誕生日の一覧）を開く */
function urlFor(people: Person[]) {
  return people.length === 1 ? `/members/${people[0].id}/birthday` : "/";
}

function dateKey(d: YMD) {
  return `${d.year}-${d.month}-${d.day}`;
}

function birthdaysIn(people: Person[], days: number, today: YMD) {
  return people.filter(
    (p) => p.birth_month != null && p.birth_day != null && daysUntilBirthday(p.birth_month, p.birth_day, today) === days,
  );
}

/**
 * 前日の夜：明日が誕生日の同期を全員に知らせる。
 * 誕生日の本人には自分の名前を含めない（サプライズのため）。
 */
export function planEveNotifications(people: Person[], recipients: string[], today: YMD): PlannedNotification[] {
  const tomorrow = birthdaysIn(people, 1, today);
  if (tomorrow.length === 0) return [];

  return recipients.flatMap((userId) => {
    const others = tomorrow.filter((p) => p.id !== userId);
    if (others.length === 0) return [];
    return [
      {
        userId,
        title: `明日は${namesOf(others)}の誕生日です！`,
        body: "みんなでお祝いしましょう！🎉",
        url: urlFor(others),
        tag: `birthday-eve-${dateKey(today)}`,
      },
    ];
  });
}

/**
 * 当日の朝：誕生日の本人には「おめでとう」と届いた件数を、
 * ほかの同期には、まだ寄せ書きを書いていない相手がいる場合だけ知らせる。
 */
export function planMorningNotifications(
  people: Person[],
  recipients: string[],
  messages: Message[],
  today: YMD,
): PlannedNotification[] {
  const todays = birthdaysIn(people, 0, today);
  if (todays.length === 0) return [];
  const tag = `birthday-today-${dateKey(today)}`;
  const wrote = (from: string, to: string) =>
    messages.some((m) => m.from_user_id === from && m.to_user_id === to && m.year === today.year);

  return recipients.flatMap((userId): PlannedNotification[] => {
    if (todays.some((p) => p.id === userId)) {
      const count = messages.filter((m) => m.to_user_id === userId && m.year === today.year).length;
      return [
        {
          userId,
          title: "お誕生日おめでとうございます！",
          body: count > 0 ? `同期から寄せ書きが${count}件届いています🎂` : "同期からの寄せ書きを見てみましょう🎂",
          url: `/members/${userId}/birthday`,
          tag,
        },
      ];
    }
    const unwritten = todays.filter((p) => !wrote(userId, p.id));
    if (unwritten.length === 0) return [];
    return [
      {
        userId,
        title: `今日は${namesOf(unwritten)}の誕生日です！`,
        body: "まだ間に合います！🎉",
        url: urlFor(unwritten),
        tag,
      },
    ];
  });
}

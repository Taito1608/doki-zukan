import Link from "next/link";
import { attachPhotoUrls, getAllProfiles, requireProfile } from "@/lib/data";
import { daysUntilBirthday, formatBirthday, todayJST } from "@/lib/birthday";
import { findCommonPoints } from "@/lib/common";
import { UPCOMING_DAYS } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { InstallHint } from "@/components/InstallHint";

export default async function HomePage() {
  const { profile: me } = await requireProfile();
  const all = await getAllProfiles();
  const today = todayJST();

  const withDays = all
    .filter((p) => p.birth_month != null && p.birth_day != null)
    .map((p) => ({ p, days: daysUntilBirthday(p.birth_month!, p.birth_day!, today) }));

  const todays = withDays.filter((x) => x.days === 0).map((x) => x.p);
  const upcoming = withDays
    .filter((x) => x.days > 0 && x.days <= UPCOMING_DAYS)
    .sort((a, b) => a.days - b.days);

  // 共通点が多い同期（上位3人）
  const matches = all
    .filter((p) => p.id !== me.id)
    .map((p) => ({ p, points: findCommonPoints(me, p) }))
    .filter((x) => x.points.length > 0)
    .sort((a, b) => b.points.length - a.points.length)
    .slice(0, 3);

  const shown = await attachPhotoUrls([...todays, ...upcoming.map((x) => x.p), ...matches.map((x) => x.p)]);
  const photo = (id: string) => shown.find((s) => s.id === id)?.photo_url ?? null;

  const myBirthdayToday = todays.some((p) => p.id === me.id);
  const othersToday = todays.filter((p) => p.id !== me.id);

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm text-stone-500">
          {today.month}月{today.day}日
        </p>
        <h1 className="text-2xl font-black">こんにちは、{me.display_name}さん</h1>
        <p className="mt-1 text-sm text-stone-600">登録している同期 {all.length}人</p>
      </header>

      <InstallHint />

      {myBirthdayToday && (
        <Link
          href={`/members/${me.id}/birthday`}
          className="block rounded-3xl bg-gradient-to-br from-brand-500 to-pink-500 p-5 text-white shadow-md"
        >
          <p className="text-3xl">🎉</p>
          <p className="mt-1 text-xl font-black">お誕生日おめでとうございます！</p>
          <p className="mt-1 text-sm opacity-90">同期からの寄せ書きを見る →</p>
        </Link>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">🎂 今日の誕生日</h2>
        {othersToday.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-stone-500 shadow-sm">今日が誕生日の同期はいません。</p>
        ) : (
          <ul className="space-y-3">
            {othersToday.map((p) => (
              <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm ring-2 ring-brand-200">
                <Link href={`/members/${p.id}`} className="flex items-center gap-3">
                  <Avatar name={p.display_name} url={photo(p.id)} size={56} />
                  <div>
                    <p className="text-lg font-bold">{p.display_name}さん</p>
                    <p className="text-sm text-stone-500">今日が誕生日です</p>
                  </div>
                </Link>
                <Link
                  href={`/members/${p.id}/birthday`}
                  className="mt-3 block rounded-xl bg-brand-500 py-3 text-center font-bold text-white active:bg-brand-600"
                >
                  寄せ書きを書く ✍️
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">📅 もうすぐ誕生日</h2>
          <ul className="divide-y divide-stone-100 rounded-2xl bg-white shadow-sm">
            {upcoming.map(({ p, days }) => (
              <li key={p.id}>
                <Link href={`/members/${p.id}`} className="flex items-center gap-3 p-3">
                  <Avatar name={p.display_name} url={photo(p.id)} size={44} />
                  <div className="flex-1">
                    <p className="font-bold">{p.display_name}</p>
                    <p className="text-xs text-stone-500">{formatBirthday(p.birth_month, p.birth_day)}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                    あと{days}日
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">✨ あなたと共通点が多い同期</h2>
        {matches.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-stone-500 shadow-sm">
            まだ見つかっていません。
            <Link href="/me/edit" className="font-bold text-brand-600 underline">
              プロフィール
            </Link>
            に出身地や趣味を追加すると見つかりやすくなります。
          </p>
        ) : (
          <ul className="space-y-3">
            {matches.map(({ p, points }) => (
              <li key={p.id}>
                <Link href={`/members/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  <Avatar name={p.display_name} url={photo(p.id)} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{p.display_name}</p>
                    <p className="truncate text-xs text-stone-600">
                      {points.map((pt) => `${pt.icon}${pt.label}`).join("　")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/members"
        className="block rounded-2xl border-2 border-stone-800 py-4 text-center text-lg font-bold active:bg-stone-100"
      >
        👥 同期を見てみる
      </Link>
    </main>
  );
}

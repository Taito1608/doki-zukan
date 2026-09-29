import Link from "next/link";
import { attachPhotoUrls, getAllProfiles, requireProfile } from "@/lib/data";
import { daysUntilBirthday, formatBirthday, todayJST } from "@/lib/birthday";
import { findCommonPoints } from "@/lib/common";
import { UPCOMING_DAYS } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { InstallHint } from "@/components/InstallHint";
import { Icon } from "@/components/Icon";
import { Arrow, SectionHeading, btnPrimary, btnSecondary } from "@/components/ui";

export default async function HomePage() {
  const [{ profile: me }, all] = await Promise.all([requireProfile(), getAllProfiles()]);
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

  const shown = await attachPhotoUrls([...todays, ...upcoming.map((x) => x.p), ...matches.map((x) => x.p)], {
    size: "thumb",
  });
  const photo = (id: string) => shown.find((s) => s.id === id)?.photo_url ?? null;

  const myBirthdayToday = todays.some((p) => p.id === me.id);
  const othersToday = todays.filter((p) => p.id !== me.id);

  return (
    <main className="space-y-10">
      <header>
        <p className="text-sm font-semibold tracking-[0.15em] text-brand-600">
          {today.month}.{String(today.day).padStart(2, "0")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">こんにちは、{me.display_name}さん</h1>
        <p className="mt-2 text-sm text-stone-500">
          登録している同期 <span className="text-base font-semibold text-ink">{all.length}</span> 人
        </p>
      </header>

      <InstallHint />

      {myBirthdayToday && (
        <Link href={`/members/${me.id}/birthday`} className="cut block bg-brand-500 p-5 text-white active:bg-brand-600">
          <p className="text-[11px] font-semibold tracking-[0.2em] opacity-80">HAPPY BIRTHDAY</p>
          <p className="mt-1 text-xl font-bold">お誕生日おめでとうございます！</p>
          <p className="mt-3 flex items-center justify-between text-sm">
            同期からの寄せ書きを見る
            <Arrow />
          </p>
        </Link>
      )}

      <section>
        <SectionHeading en="BIRTHDAY">今日が誕生日</SectionHeading>
        {othersToday.length === 0 ? (
          <p className="cut bg-panel px-5 py-6 text-center text-sm text-stone-500">今日が誕生日の同期はいません</p>
        ) : (
          <ul className="space-y-3">
            {othersToday.map((p) => (
              <li key={p.id} className="cut border-b-[3px] border-brand-500 bg-panel p-5">
                <Link href={`/members/${p.id}`} className="flex items-center gap-4">
                  <Avatar name={p.display_name} url={photo(p.id)} size={64} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold">{p.display_name}さん</p>
                    {p.name_roman && <p className="truncate text-xs tracking-[0.08em] text-stone-500">{p.name_roman}</p>}
                    <p className="text-xs text-stone-500">今日が誕生日です</p>
                  </div>
                  <Arrow className="text-brand-500" />
                </Link>
                <Link href={`/members/${p.id}/birthday`} className={`${btnPrimary} mt-4`}>
                  <span className="flex items-center gap-2">
                    <Icon name="pen" size={18} />
                    寄せ書きを書く
                  </span>
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="border-t border-stone-200 pt-8">
          <SectionHeading en="COMING SOON">もうすぐ誕生日</SectionHeading>
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {upcoming.map(({ p, days }) => (
              <li key={p.id}>
                <Link href={`/members/${p.id}`} className="flex items-center gap-3 py-3 active:bg-panel">
                  <Avatar name={p.display_name} url={photo(p.id)} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.display_name}</p>
                    <p className="text-xs text-stone-500">{formatBirthday(p.birth_month, p.birth_day)}</p>
                  </div>
                  <span className="text-sm text-stone-500">
                    あと<span className="mx-0.5 text-lg font-semibold text-brand-600">{days}</span>日
                  </span>
                  <Arrow className="ml-1 text-stone-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-stone-200 pt-8">
        <SectionHeading en="IN COMMON" more={matches.length > 0 ? "/members" : undefined}>
          あなたと共通点が多い同期
        </SectionHeading>
        {matches.length === 0 ? (
          <p className="cut bg-panel p-5 text-sm leading-relaxed text-stone-600">
            まだ見つかっていません。
            <Link href="/me/edit" className="font-bold text-brand-600 underline">
              プロフィール
            </Link>
            に出身地や趣味を追加すると見つかりやすくなります。
          </p>
        ) : (
          <ul className="space-y-2">
            {matches.map(({ p, points }) => (
              <li key={p.id}>
                <Link href={`/members/${p.id}`} className="cut flex items-center gap-3 bg-panel p-4 active:bg-stone-200">
                  <Avatar name={p.display_name} url={photo(p.id)} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{p.display_name}</p>
                    <p className="mt-0.5 flex gap-3 overflow-hidden text-xs whitespace-nowrap text-stone-500">
                      {points.map((pt) => (
                        <span key={pt.label} className="flex items-center gap-1">
                          <Icon name={pt.icon} size={13} className="text-brand-500" />
                          {pt.label}
                        </span>
                      ))}
                    </p>
                  </div>
                  <Arrow className="text-brand-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/members" className={btnSecondary}>
        <span className="flex items-center gap-2">
          <Icon name="users" size={20} />
          同期を見てみる
        </span>
        <Arrow className="text-brand-500" />
      </Link>
    </main>
  );
}

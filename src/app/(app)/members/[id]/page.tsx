import Link from "next/link";
import { notFound } from "next/navigation";
import { attachPhotoUrls, requireProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { findCommonPoints } from "@/lib/common";
import { formatBirthday, messageTarget } from "@/lib/birthday";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Arrow, SectionHeading, btnPrimary, btnSecondary } from "@/components/ui";
import type { Profile } from "@/lib/types";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ profile: me }, { data }] = await Promise.all([
    requireProfile(),
    supabase.from("profiles").select("*").eq("id", id).maybeSingle<Profile>(),
  ]);
  if (!data) notFound();
  const [p] = await attachPhotoUrls([data]);

  const isMe = p.id === me.id;
  const points = isMe ? [] : findCommonPoints(me, p);
  const birthday = formatBirthday(p.birth_month, p.birth_day);
  const target =
    p.birth_month != null && p.birth_day != null ? messageTarget(p.birth_month, p.birth_day) : null;

  const rows: { label: string; value: string | null }[] = [
    { label: "誕生日", value: birthday },
    { label: "出身地", value: p.hometown },
    { label: "職種", value: p.job_type },
  ];

  return (
    <main className="space-y-10">
      <section className="flex flex-col items-center text-center">
        <Avatar name={p.display_name} url={p.photo_url} size={120} />
        <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-brand-600">{isMe ? "MY PROFILE" : "PROFILE"}</p>
        <h1 className="mt-1 text-2xl font-bold">{p.display_name}</h1>
        {p.name_roman && <p className="mt-1 text-sm tracking-[0.12em] text-stone-500">{p.name_roman}</p>}
        {p.message && (
          <p className="cut mt-5 w-full bg-panel px-5 py-4 text-left text-sm leading-relaxed text-stone-700">
            {p.message}
          </p>
        )}
      </section>

      {target?.canWrite && !isMe && (
        <Link href={`/members/${p.id}/birthday`} className={btnPrimary}>
          <span className="flex items-center gap-2">
            <Icon name="cake" size={20} />
            {target.diff === 0
              ? "今日が誕生日！寄せ書きを書く"
              : target.diff > 0
                ? `誕生日まであと${target.diff}日｜寄せ書きを書く`
                : "誕生日の寄せ書きを書く"}
          </span>
          <Arrow />
        </Link>
      )}

      {!isMe && points.length > 0 && (
        <section className="cut border-b-[3px] border-brand-500 bg-panel p-5">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">IN COMMON</p>
          <h2 className="mt-0.5 mb-3 text-lg font-bold">あなたとの共通点</h2>
          <ul className="space-y-2">
            {points.map((pt) => (
              <li key={pt.label} className="flex items-center gap-2.5">
                <Icon name={pt.icon} size={18} className="text-brand-500" />
                {pt.label}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-stone-500">次に会ったとき、話しかけるきっかけにしてみてください。</p>
        </section>
      )}

      <section>
        <SectionHeading en="ABOUT">基本情報</SectionHeading>
        <dl className="divide-y divide-stone-200 border-y border-stone-200">
          {rows.map((r) => (
            <div key={r.label} className="flex py-4">
              <dt className="w-24 shrink-0 text-sm text-stone-500">{r.label}</dt>
              <dd className="font-medium">{r.value ?? <span className="text-stone-300">未登録</span>}</dd>
            </div>
          ))}
        </dl>
      </section>

      {p.hobbies.length > 0 && (
        <section>
          <SectionHeading en="FAVORITES">趣味・好きなこと</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {p.hobbies.map((h) => (
              <Link
                key={h}
                href={`/members?hobby=${encodeURIComponent(h)}`}
                className="border border-stone-300 px-3 py-1.5 text-sm active:bg-panel"
              >
                #{h}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-400">タグをタップすると、同じ趣味の同期が見つかります</p>
        </section>
      )}

      {isMe && (
        <div className="space-y-3">
          <Link href="/me/edit" className={btnPrimary}>
            <span className="flex items-center gap-2">
              <Icon name="pen" size={18} />
              プロフィールを編集
            </span>
            <Arrow />
          </Link>
          {birthday && (
            <Link href={`/members/${p.id}/birthday`} className={btnSecondary}>
              <span className="flex items-center gap-2">
                <Icon name="gift" size={18} />
                自分宛ての寄せ書きを見る
              </span>
              <Arrow className="text-brand-500" />
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

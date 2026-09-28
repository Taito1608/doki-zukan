import Link from "next/link";
import { notFound } from "next/navigation";
import { attachPhotoUrls, requireProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { findCommonPoints } from "@/lib/common";
import { formatBirthday, messageTarget } from "@/lib/birthday";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
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
    <main className="space-y-5">
      <section className="flex flex-col items-center rounded-3xl bg-white px-5 pt-8 pb-6 text-center shadow-sm">
        <Avatar name={p.display_name} url={p.photo_url} size={120} />
        <h1 className="mt-4 text-2xl font-black">{p.display_name}</h1>
        {p.message && (
          <p className="mt-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-700">
            「{p.message}」
          </p>
        )}
      </section>

      {!isMe && points.length > 0 && (
        <section className="rounded-3xl bg-brand-50 p-5 ring-1 ring-brand-200">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-brand-700">
            <Icon name="sparkles" size={18} />
            あなたとの共通点
          </h2>
          <ul className="space-y-1.5">
            {points.map((pt) => (
              <li key={pt.label} className="flex items-center gap-2 text-base">
                <Icon name={pt.icon} size={18} className="text-brand-500" />
                {pt.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-stone-600">次に会ったとき、話しかけるきっかけにしてみてください。</p>
        </section>
      )}

      {target?.canWrite && !isMe && (
        <Link
          href={`/members/${p.id}/birthday`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white shadow-sm active:bg-brand-600"
        >
          <Icon name="cake" />
          {target.diff === 0
            ? "今日が誕生日！寄せ書きを書く"
            : target.diff > 0
              ? `誕生日まであと${target.diff}日｜寄せ書きを書く`
              : "誕生日の寄せ書きを書く"}
        </Link>
      )}

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <dl className="divide-y divide-stone-100">
          {rows.map((r) => (
            <div key={r.label} className="flex py-3 first:pt-0">
              <dt className="w-20 shrink-0 text-sm text-stone-500">{r.label}</dt>
              <dd className="font-medium">{r.value ?? <span className="text-stone-300">未登録</span>}</dd>
            </div>
          ))}
        </dl>

        {p.hobbies.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-stone-500">趣味・好きなこと</p>
            <div className="flex flex-wrap gap-2">
              {p.hobbies.map((h) => (
                <Link
                  key={h}
                  href={`/members?hobby=${encodeURIComponent(h)}`}
                  className="rounded-full bg-stone-100 px-3 py-1.5 text-sm active:bg-stone-200"
                >
                  #{h}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-400">タグをタップすると、同じ趣味の同期が見つかります</p>
          </div>
        )}
      </section>

      {isMe && (
        <div className="space-y-3">
          <Link
            href="/me/edit"
            className="block rounded-2xl bg-stone-800 py-4 text-center text-lg font-bold text-white active:bg-stone-900"
          >
            プロフィールを編集
          </Link>
          {birthday && (
            <Link
              href={`/members/${p.id}/birthday`}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-stone-800 py-4 font-bold active:bg-stone-100"
            >
              <Icon name="gift" />
              自分宛ての寄せ書きを見る
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

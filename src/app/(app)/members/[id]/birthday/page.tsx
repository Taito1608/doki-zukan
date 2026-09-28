import Link from "next/link";
import { notFound } from "next/navigation";
import { attachPhotoUrls, requireProfile } from "@/lib/data";
import { formatBirthday, messageTarget } from "@/lib/birthday";
import { deleteMessage } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import type { BirthdayMessage, Profile } from "@/lib/types";
import { MessageForm } from "./MessageForm";

export default async function BirthdayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile: me, member } = await requireProfile();

  const { data: target } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle<Profile>();
  if (!target) notFound();

  const isMe = target.id === me.id;
  const hasBirthday = target.birth_month != null && target.birth_day != null;
  const t = hasBirthday ? messageTarget(target.birth_month!, target.birth_day!) : null;

  const { data: msgData } = await supabase
    .from("birthday_messages")
    .select("*")
    .eq("to_user_id", target.id)
    .order("year", { ascending: false })
    .order("created_at", { ascending: true });
  const messages = (msgData ?? []) as BirthdayMessage[];

  // 書いた人の名前と写真
  const authorIds = [...new Set(messages.map((m) => m.from_user_id))];
  const { data: authorData } = authorIds.length
    ? await supabase.from("profiles").select("*").in("id", authorIds)
    : { data: [] as Profile[] };
  const authors = await attachPhotoUrls([target, ...((authorData ?? []) as Profile[])]);
  const authorOf = (uid: string) => authors.find((a) => a.id === uid);
  const targetWithPhoto = authorOf(target.id)!;

  // 本人には、誕生日当日まで今年の寄せ書きを隠しておく（サプライズ）
  const hiddenYear = isMe && t && t.diff > 0 ? t.year : null;
  const hiddenCount = hiddenYear ? messages.filter((m) => m.year === hiddenYear).length : 0;

  const years = [...new Set(messages.map((m) => m.year))].filter((y) => y !== hiddenYear);
  const myMessage = t ? messages.find((m) => m.from_user_id === me.id && m.year === t.year) : undefined;

  return (
    <main className="space-y-5">
      <Link href={`/members/${target.id}`} className="text-sm text-stone-500">
        ← プロフィールへ戻る
      </Link>

      <section className="rounded-3xl bg-gradient-to-br from-brand-500 to-pink-500 p-6 text-center text-white shadow-md">
        <div className="flex justify-center">
          <Avatar name={target.display_name} url={targetWithPhoto.photo_url} size={88} />
        </div>
        <h1 className="mt-3 text-2xl font-black">{target.display_name}さんへの寄せ書き</h1>
        {hasBirthday && (
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm opacity-90">
            <Icon name="cake" size={16} />
            {formatBirthday(target.birth_month, target.birth_day)}
          </p>
        )}
      </section>

      {!hasBirthday && (
        <p className="rounded-2xl bg-white p-4 text-sm text-stone-600 shadow-sm">
          {isMe ? (
            <>
              誕生日が未登録です。
              <Link href="/me/edit" className="font-bold text-brand-600 underline">
                プロフィール
              </Link>
              から登録すると、誕生日に同期から寄せ書きが届きます。
            </>
          ) : (
            "この同期は誕生日を登録していません。"
          )}
        </p>
      )}

      {!isMe && t && (t.canWrite ? (
        <MessageForm toUserId={target.id} toName={target.display_name} existing={myMessage?.body ?? null} />
      ) : (
        <p className="rounded-2xl bg-white p-4 text-sm text-stone-600 shadow-sm">
          寄せ書きは誕生日の前後1週間だけ書けます。
        </p>
      ))}

      {hiddenYear && (
        <p className="rounded-2xl bg-brand-50 p-4 text-center text-sm leading-relaxed text-brand-700 ring-1 ring-brand-200">
          <Icon name="gift" size={16} className="mr-1 -mt-0.5 align-middle" />
          今年の寄せ書きは、誕生日当日に公開されます。
          {hiddenCount > 0 && (
            <>
              <br />
              すでに <b>{hiddenCount}件</b> 届いています！
            </>
          )}
        </p>
      )}

      {years.length === 0 && !hiddenYear && hasBirthday && (
        <p className="text-center text-sm text-stone-500">まだメッセージはありません。</p>
      )}

      {years.map((year) => (
        <section key={year}>
          <h2 className="mb-3 font-bold text-stone-600">
            {year}年 <span className="text-sm font-normal">（{messages.filter((m) => m.year === year).length}件）</span>
          </h2>
          <ul className="space-y-3">
            {messages
              .filter((m) => m.year === year)
              .map((m) => {
                const a = authorOf(m.from_user_id);
                const canDelete = m.from_user_id === me.id || m.to_user_id === me.id || member.is_admin;
                return (
                  <li key={m.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar name={a?.display_name ?? "退会した同期"} url={a?.photo_url ?? null} size={28} />
                      {a ? (
                        <Link href={`/members/${a.id}`} className="text-sm font-bold">
                          {a.display_name}
                        </Link>
                      ) : (
                        <span className="text-sm text-stone-400">退会した同期</span>
                      )}
                      {canDelete && (
                        <form action={deleteMessage} className="ml-auto">
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="to_user_id" value={m.to_user_id} />
                          <button className="text-xs text-stone-400 underline">削除</button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </main>
  );
}

import Link from "next/link";
import { attachPhotoUrls, getAllProfiles, requireProfile } from "@/lib/data";
import { findCommonPoints } from "@/lib/common";
import { JOB_TYPES, PREFECTURES } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";

type Search = { q?: string; hometown?: string; job?: string; hobby?: string };

function includes(hay: string | null | undefined, needle: string) {
  return (hay ?? "").normalize("NFKC").toLowerCase().includes(needle);
}

export default async function MembersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [{ profile: me }, { q = "", hometown = "", job = "", hobby = "" }, all] = await Promise.all([
    requireProfile(),
    searchParams,
    getAllProfiles(),
  ]);

  const needle = q.normalize("NFKC").trim().toLowerCase();
  const hobbyNeedle = hobby.normalize("NFKC").trim().toLowerCase();

  const filtered = all.filter((p) => {
    if (hometown && p.hometown !== hometown) return false;
    if (job && p.job_type !== job) return false;
    if (hobbyNeedle && !p.hobbies.some((h) => h.toLowerCase() === hobbyNeedle)) return false;
    if (needle) {
      const hit =
        includes(p.display_name, needle) ||
        includes(p.department, needle) ||
        includes(p.hometown, needle) ||
        includes(p.message, needle) ||
        p.hobbies.some((h) => includes(h, needle));
      if (!hit) return false;
    }
    return true;
  });

  const withPhotos = await attachPhotoUrls(filtered);
  const isFiltered = !!(q || hometown || job || hobby);

  return (
    <main>
      <h1 className="mb-4 text-2xl font-black">同期一覧</h1>

      <form className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="名前・趣味・配属などで検索"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-brand-500"
        />
        <div className="flex gap-2">
          <select
            name="hometown"
            defaultValue={hometown}
            className="w-1/2 rounded-xl border border-stone-300 bg-white px-3 py-3 outline-none"
          >
            <option value="">出身地：すべて</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            name="job"
            defaultValue={job}
            className="w-1/2 rounded-xl border border-stone-300 bg-white px-3 py-3 outline-none"
          >
            <option value="">職種：すべて</option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        {hobby && <input type="hidden" name="hobby" value={hobby} />}
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-stone-800 py-3 font-bold text-white active:bg-stone-900">
            検索
          </button>
          {isFiltered && (
            <Link href="/members" className="rounded-xl px-4 py-3 text-sm text-stone-500 underline">
              条件をクリア
            </Link>
          )}
        </div>
      </form>

      {hobby && (
        <p className="mt-3 text-sm">
          趣味「<b>{hobby}</b>」で絞り込み中
        </p>
      )}

      <p className="mt-4 mb-2 text-sm text-stone-500">{filtered.length}人</p>

      <ul className="grid grid-cols-2 gap-3">
        {withPhotos.map((p) => {
          const common = findCommonPoints(me, p).length;
          const isMe = p.id === me.id;
          return (
            <li key={p.id}>
              <Link
                href={`/members/${p.id}`}
                className="flex h-full flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm active:bg-stone-50"
              >
                <Avatar name={p.display_name} url={p.photo_url} size={72} />
                <p className="mt-2 line-clamp-2 font-bold">{p.display_name}</p>
                <p className="text-xs text-stone-500">{p.hometown ?? " "}</p>
                {isMe ? (
                  <span className="mt-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">あなた</span>
                ) : common > 0 ? (
                  <span className="mt-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                    共通点 {common}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-sm text-stone-500">条件に合う同期が見つかりませんでした。</p>
      )}
    </main>
  );
}

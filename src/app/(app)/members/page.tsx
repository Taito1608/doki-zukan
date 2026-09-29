import Link from "next/link";
import { attachPhotoUrls, getAllProfiles, requireProfile } from "@/lib/data";
import { findCommonPoints } from "@/lib/common";
import { JOB_TYPES, PREFECTURES } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { PageHeading } from "@/components/ui";

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
        includes(p.name_roman, needle) ||
        includes(p.hometown, needle) ||
        includes(p.message, needle) ||
        p.hobbies.some((h) => includes(h, needle));
      if (!hit) return false;
    }
    return true;
  });

  const withPhotos = await attachPhotoUrls(filtered, { size: "thumb" });
  const isFiltered = !!(q || hometown || job || hobby);

  const fieldClass =
    "w-full border-b border-stone-300 bg-transparent py-3 outline-none focus:border-brand-500";

  return (
    <main>
      <PageHeading en="MEMBERS">同期一覧</PageHeading>

      <form className="cut space-y-3 bg-panel px-4 pt-2 pb-4">
        <div className="relative">
          <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            type="search"
            enterKeyHint="search"
            defaultValue={q}
            placeholder="名前・趣味・出身地などで検索"
            className={`${fieldClass} pl-7`}
          />
        </div>
        <div className="flex gap-4">
          <select name="hometown" defaultValue={hometown} className={fieldClass} aria-label="出身地">
            <option value="">出身地：すべて</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select name="job" defaultValue={job} className={fieldClass} aria-label="職種">
            <option value="">職種：すべて</option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        {hobby && <input type="hidden" name="hobby" value={hobby} />}
        <div className="flex items-center gap-4 pt-1">
          <button className="cut flex-1 bg-ink py-3 font-bold text-white active:bg-black">検索</button>
          {isFiltered && (
            <Link href="/members" className="text-sm text-stone-500 underline">
              条件をクリア
            </Link>
          )}
        </div>
      </form>

      <div className="mt-6 mb-3 flex items-baseline justify-between border-b border-stone-200 pb-2">
        <p className="text-sm text-stone-500">
          {hobby ? (
            <>
              趣味「<b className="text-ink">{hobby}</b>」
            </>
          ) : (
            "すべての同期"
          )}
        </p>
        <p className="text-sm text-stone-500">
          <span className="mr-0.5 text-lg font-semibold text-ink">{filtered.length}</span>人
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {withPhotos.map((p) => {
          const common = findCommonPoints(me, p).length;
          const isMe = p.id === me.id;
          return (
            <li key={p.id}>
              <Link
                href={`/members/${p.id}`}
                className="cut flex h-full flex-col items-center bg-panel px-3 pt-5 pb-4 text-center active:bg-stone-200"
              >
                <Avatar name={p.display_name} url={p.photo_url} size={72} />
                <p className="mt-3 line-clamp-2 font-bold">{p.display_name}</p>
                {p.name_roman && (
                  <p className="line-clamp-1 text-[11px] tracking-[0.08em] text-stone-500">{p.name_roman}</p>
                )}
                <p className="mt-0.5 text-xs text-stone-500">{p.hometown ?? " "}</p>
                {isMe ? (
                  <span className="mt-2 text-[11px] font-semibold tracking-wider text-stone-500">あなた</span>
                ) : common > 0 ? (
                  <span className="mt-2 border-b-2 border-brand-500 text-[11px] font-bold text-brand-700">
                    共通点 {common}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-500">条件に合う同期が見つかりませんでした。</p>
      )}
    </main>
  );
}

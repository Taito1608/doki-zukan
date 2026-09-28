import Link from "next/link";

// 画面全体で使う見た目の部品（見出し・矢印・ボタン）

/** 小さな三角の矢印（リンクやボタンの右端に置く） */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 10" width="7" height="9" aria-hidden="true" className={`shrink-0 fill-current ${className}`}>
      <path d="M0 0 8 5 0 10z" />
    </svg>
  );
}

/** 英字の小見出し＋日本語の見出し。more を渡すと右に「一覧 ▶」を出す */
export function SectionHeading({ en, children, more }: { en: string; children: React.ReactNode; more?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">{en}</p>
        <h2 className="mt-0.5 text-lg font-bold">{children}</h2>
      </div>
      {more && (
        <Link href={more} className="flex items-center gap-1.5 py-1 text-sm font-medium">
          一覧
          <Arrow className="text-brand-500" />
        </Link>
      )}
    </div>
  );
}

/** ページ上部の見出し */
export function PageHeading({ en, children }: { en: string; children: React.ReactNode }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-600">{en}</p>
      <h1 className="mt-1 text-2xl font-bold">{children}</h1>
    </header>
  );
}

// ボタン（角を切ったパネル型。右端に矢印）
export const btnPrimary =
  "cut flex w-full items-center justify-between gap-3 bg-brand-500 px-5 py-4 font-bold text-white active:bg-brand-600 disabled:opacity-50";
export const btnSecondary =
  "cut flex w-full items-center justify-between gap-3 bg-panel px-5 py-4 font-bold active:bg-stone-200 disabled:opacity-50";

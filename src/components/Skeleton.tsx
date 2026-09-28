/** 読み込み中に表示する灰色のプレースホルダ */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-stone-200 ${className}`} />;
}

/** スクリーンリーダー向けの読み込み中表示 */
export function LoadingLabel() {
  return (
    <p role="status" className="sr-only">
      読み込み中…
    </p>
  );
}

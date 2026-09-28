import { LoadingLabel, Skeleton } from "@/components/Skeleton";

// 同期のページ・マイページ・寄せ書きページ用
export default function Loading() {
  return (
    <main className="space-y-10">
      <LoadingLabel />
      <section className="flex flex-col items-center gap-3">
        <Skeleton className="h-[120px] w-[120px] rounded-full" />
        <Skeleton className="mt-2 h-3 w-16" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="cut mt-2 h-16 w-full" />
      </section>
      <section className="space-y-4">
        <Skeleton className="h-5 w-28" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-6 border-b border-stone-200 pb-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </section>
    </main>
  );
}

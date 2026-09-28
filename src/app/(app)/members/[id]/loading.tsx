import { LoadingLabel, Skeleton } from "@/components/Skeleton";

// 同期のページ・マイページ・寄せ書きページ用
export default function Loading() {
  return (
    <main className="space-y-5">
      <LoadingLabel />
      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white px-5 pt-8 pb-6 shadow-sm">
        <Skeleton className="h-[120px] w-[120px] rounded-full" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </section>
      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </section>
    </main>
  );
}

import { LoadingLabel, Skeleton } from "@/components/Skeleton";

// ホームなど、個別の読み込み画面がないページ用
export default function Loading() {
  return (
    <main className="space-y-6">
      <LoadingLabel />
      <header className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32" />
      </header>
      {[0, 1].map((i) => (
        <section key={i} className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            {[0, 1].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

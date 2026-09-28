import { LoadingLabel, Skeleton } from "@/components/Skeleton";

// ホームなど、個別の読み込み画面がないページ用
export default function Loading() {
  return (
    <main className="space-y-10">
      <LoadingLabel />
      <header className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-32" />
      </header>
      {[0, 1].map((i) => (
        <section key={i} className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="cut space-y-4 bg-panel p-5">
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

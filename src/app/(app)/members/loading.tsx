import { LoadingLabel, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main>
      <LoadingLabel />
      <h1 className="mb-4 text-2xl font-black">同期一覧</h1>
      <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
        <Skeleton className="h-12" />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-12 w-1/2" />
        </div>
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="mt-4 mb-2 h-4 w-12" />
      <ul className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
            <Skeleton className="h-[72px] w-[72px] rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </li>
        ))}
      </ul>
    </main>
  );
}

import { LoadingLabel, Skeleton } from "@/components/Skeleton";
import { PageHeading } from "@/components/ui";

export default function Loading() {
  return (
    <main>
      <LoadingLabel />
      <PageHeading en="MEMBERS">同期一覧</PageHeading>
      <div className="cut space-y-4 bg-panel p-4">
        <Skeleton className="h-9" />
        <div className="flex gap-4">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-9 w-1/2" />
        </div>
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="mt-6 mb-3 h-6" />
      <ul className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="cut flex flex-col items-center gap-2 bg-panel px-3 pt-5 pb-4">
            <Skeleton className="h-[72px] w-[72px] rounded-full" />
            <Skeleton className="mt-1 h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </li>
        ))}
      </ul>
    </main>
  );
}

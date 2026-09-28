import { requireProfile } from "@/lib/data";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireProfile();

  return (
    <>
      <div className="mx-auto min-h-dvh max-w-md px-4 pt-6 pb-28">{children}</div>
      <BottomNav myId={user.id} />
    </>
  );
}

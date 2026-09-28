import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
import { ProfileForm } from "@/components/ProfileForm";

export default async function OnboardingPage() {
  const { user, member, profile } = await getSession();
  if (!user) redirect("/login");
  if (!member) redirect("/join");
  if (profile) redirect("/");

  const googleName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  return (
    <main className="mx-auto max-w-md px-5 pt-10 pb-16">
      <h1 className="text-2xl font-black">プロフィールを作ろう</h1>
      <p className="mt-2 mb-8 leading-relaxed text-stone-600">
        名前以外はすべて任意です。あとからいつでも変更できます。
        <br />
        趣味や出身地を入れると、同期との共通点が見つかります。
      </p>
      <ProfileForm
        userId={user.id}
        initial={{ display_name: googleName.slice(0, 30) }}
        initialPhotoUrl={null}
        next="home"
        submitLabel="はじめる"
      />
    </main>
  );
}

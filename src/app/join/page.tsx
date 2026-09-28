import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
import { signOut } from "@/app/actions";
import { Icon } from "@/components/Icon";
import { JoinForm } from "./JoinForm";

export default async function JoinPage() {
  const { user, member } = await getSession();
  if (!user) redirect("/login");
  if (member) redirect("/onboarding");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
      <div className="cut mb-5 flex h-16 w-16 items-center justify-center bg-brand-500 text-white">
        <Icon name="key" size={32} />
      </div>
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-600">INVITATION</p>
      <h1 className="mt-1 text-2xl font-bold">招待コードを入力</h1>
      <p className="mt-3 mb-8 text-center leading-relaxed text-stone-600">
        同期だけが使えるサービスです。
        <br />
        共有された招待コードを入力してください。
      </p>

      <JoinForm />

      <form action={signOut} className="mt-10">
        <button className="text-sm text-stone-500 underline">別のアカウントでログインする</button>
      </form>
    </main>
  );
}

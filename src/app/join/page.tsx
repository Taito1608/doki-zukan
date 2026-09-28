import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
import { signOut } from "@/app/actions";
import { JoinForm } from "./JoinForm";

export default async function JoinPage() {
  const { user, member } = await getSession();
  if (!user) redirect("/login");
  if (member) redirect("/onboarding");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
      <div className="mb-3 text-5xl">🔑</div>
      <h1 className="text-2xl font-black">招待コードを入力</h1>
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

import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
import { Icon } from "@/components/Icon";
import { LoginButton } from "./LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await getSession();
  if (user) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
      <div className="cut mb-5 flex h-20 w-20 items-center justify-center bg-brand-500 text-white">
        <Icon name="book" size={44} strokeWidth={1.75} />
      </div>
      <p className="text-xs font-semibold tracking-[0.3em] text-brand-600">DOKI ZUKAN</p>
      <h1 className="mt-1 text-3xl font-bold">同期図鑑</h1>
      <p className="mt-3 text-center leading-relaxed text-stone-600">
        共通点から話しかけて、
        <br />
        同期ともっと仲良くなろう。
      </p>

      <div className="mt-10 w-full">
        <LoginButton />
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">
          ログインに失敗しました。もう一度お試しください。
        </p>
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-stone-500">
        閲覧できるのは、招待コードで登録した同期だけです。
      </p>
    </main>
  );
}

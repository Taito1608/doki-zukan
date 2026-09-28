import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";
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
      <div className="mb-3 text-6xl">📖</div>
      <h1 className="text-3xl font-black tracking-tight">同期図鑑</h1>
      <p className="mt-3 text-center leading-relaxed text-stone-600">
        同期のプロフィールと共通点を知って、
        <br />
        誕生日を寄せ書きでお祝いしよう。
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

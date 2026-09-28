import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-3 text-xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-stone-600">退会した同期のページか、URLが間違っている可能性があります。</p>
      <Link href="/" className="mt-8 rounded-2xl bg-brand-500 px-8 py-3 font-bold text-white">
        ホームへ戻る
      </Link>
    </main>
  );
}

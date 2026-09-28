import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Icon name="search" size={48} strokeWidth={1.75} className="text-stone-400" />
      <h1 className="mt-3 text-xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-stone-600">退会した同期のページか、URLが間違っている可能性があります。</p>
      <Link href="/" className="cut mt-8 bg-brand-500 px-10 py-3.5 font-bold text-white">
        ホームへ戻る
      </Link>
    </main>
  );
}

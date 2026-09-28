import { attachPhotoUrls, requireProfile } from "@/lib/data";
import { deleteAccount, signOut } from "@/app/actions";
import { ProfileForm } from "@/components/ProfileForm";

export default async function EditProfilePage() {
  const { user, profile } = await requireProfile();
  const [withPhoto] = await attachPhotoUrls([profile]);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-black">プロフィールを編集</h1>

      <ProfileForm
        userId={user.id}
        initial={profile}
        initialPhotoUrl={withPhoto.photo_url}
        next="profile"
        submitLabel="保存する"
      />

      <section className="mt-12 space-y-4 border-t border-stone-200 pt-8">
        <h2 className="font-bold text-stone-600">アカウント</h2>

        <form action={signOut}>
          <button className="w-full rounded-2xl border border-stone-300 bg-white py-3.5 font-bold active:bg-stone-100">
            ログアウト
          </button>
        </form>

        <details className="rounded-2xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm text-red-600">アカウントを削除する</summary>
          <form action={deleteAccount} className="mt-4 space-y-3">
            <p className="text-sm leading-relaxed text-stone-600">
              プロフィール・写真・あなたが書いた寄せ書き・あなた宛ての寄せ書きがすべて削除され、元に戻せません。
              確認のため「削除」と入力してください。
            </p>
            <input
              name="confirm"
              required
              pattern="削除"
              autoComplete="off"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-red-500"
            />
            <button className="w-full rounded-2xl bg-red-600 py-3.5 font-bold text-white active:bg-red-700">
              完全に削除する
            </button>
          </form>
        </details>
      </section>
    </main>
  );
}

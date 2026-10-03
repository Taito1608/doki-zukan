import { attachPhotoUrls, requireProfile } from "@/lib/data";
import { deleteAccount, signOut } from "@/app/actions";
import { NotificationSetting } from "@/components/NotificationSetting";
import { ProfileForm } from "@/components/ProfileForm";
import { PageHeading } from "@/components/ui";

export default async function EditProfilePage() {
  const { user, profile } = await requireProfile();
  const [withPhoto] = await attachPhotoUrls([profile]);

  return (
    <main>
      <PageHeading en="EDIT PROFILE">プロフィールを編集</PageHeading>

      <ProfileForm
        userId={user.id}
        initial={profile}
        initialPhotoUrl={withPhoto.photo_url}
        next="profile"
        submitLabel="保存する"
      />

      <NotificationSetting />

      <section className="mt-12 space-y-4 border-t border-stone-200 pt-8">
        <h2 className="text-lg font-bold">アカウント</h2>

        <form action={signOut}>
          <button className="cut w-full bg-panel py-3.5 font-bold active:bg-stone-200">
            ログアウト
          </button>
        </form>

        <details className="border-t border-stone-200 pt-4">
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
              className="w-full border border-stone-300 px-4 py-3 outline-none focus:border-red-500"
            />
            <button className="cut w-full bg-red-600 py-3.5 font-bold text-white active:bg-red-700">
              完全に削除する
            </button>
          </form>
        </details>
      </section>
    </main>
  );
}

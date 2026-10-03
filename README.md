# 同期図鑑

同期のプロフィールと共通点を見える化し、誕生日を寄せ書きでお祝いするWebアプリです。

- Next.js 15（App Router）＋ Supabase（認証・DB・写真保存）＋ Vercel
- Googleログイン＋招待コードで、同期だけが使えるようにしています
- スマホ優先の画面で、ホーム画面に追加してアプリのように使えます（PWA）

## 実装済みの機能

| 機能 | 画面 |
|---|---|
| Googleログイン | `/login` |
| 招待コードによる参加 | `/join` |
| 初回プロフィール登録 | `/onboarding` |
| ホーム（今日の誕生日・もうすぐ誕生日・共通点が多い同期） | `/` |
| 同期一覧・検索・絞り込み（名前、趣味、出身地、職種） | `/members` |
| プロフィール詳細・共通点表示 | `/members/[id]` |
| 寄せ書き（誕生日の前後1週間だけ書ける） | `/members/[id]/birthday` |
| プロフィール編集・ログアウト・アカウント削除 | `/me/edit` |

補足：

- 本人は、誕生日当日まで今年の寄せ書きを見られません（件数だけ表示されるサプライズ仕様）。
- 寄せ書きは書いた人・本人・管理者が削除できます。
- 写真は非公開の保存領域に置き、同期にだけ期限付きURLで表示します。アップロード前にスマホ側で512pxに縮小します。

**未実装（次の段階）**：誕生日のWeb Push通知と、週1回のまとめメール。

---

## セットアップ手順（所要時間 30〜40分）

### 1. Supabase のプロジェクトを作る

1. https://supabase.com でプロジェクトを作成します（リージョンは **Northeast Asia (Tokyo)** がおすすめです）。
2. 左メニューの **SQL Editor** を開き、`supabase/schema.sql` の中身を全部貼り付けて **Run** します。
3. 招待コードを変更する場合は、**Table Editor → invite_codes** で編集します。初期値は `DOKI2027` です。
4. **Project Settings → API** で `Project URL` と `anon public` キーを控えておきます。

### 2. Google ログインを設定する

1. https://console.cloud.google.com で新しいプロジェクトを作ります。
2. **APIとサービス → OAuth同意画面** で、次のとおり設定します。
   - ユーザーの種類：**外部**
   - アプリ名：同期図鑑、サポートメール：自分のメールアドレス
   - スコープは追加不要です（email・profile のみ使います）。
   - 最後に **「アプリを公開」**（本番環境へ移行）を押します。
     「テスト」のままだと、テストユーザーに登録した人しかログインできません。
3. **認証情報 → 認証情報を作成 → OAuthクライアントID** で、次のとおり作成します。
   - 種類：**ウェブアプリケーション**
   - 承認済みの JavaScript 生成元：`http://localhost`、`http://localhost:3000`、`https://<あなたのアプリ>.vercel.app`
   - 承認済みのリダイレクトURI：`https://<SupabaseのプロジェクトID>.supabase.co/auth/v1/callback`
4. 発行された **クライアントID** と **クライアントシークレット** を、
   Supabase の **Authentication → Sign In / Providers → Google** に貼り付けて有効にします。
5. 同じ **クライアントID** を、環境変数 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` に設定します（手順3・4）。
   Google のボタンをアプリ内に表示してログインするため、Google の画面に Supabase の URL ではなく
   アプリのドメインが表示されます。未設定の場合は、Supabase 経由のログインになります。

### 3. ローカルで動かす

```bash
cp .env.local.example .env.local   # 1-4で控えた値を書き込む
npm install
npm run dev
```

Supabase の **Authentication → URL Configuration** の **Redirect URLs** に、
`http://localhost:3000/**` を追加してから http://localhost:3000 を開きます。

### 4. Vercel に公開する

1. このフォルダを GitHub のリポジトリに push します。
2. https://vercel.com で **Add New → Project** からそのリポジトリを選びます。
3. **Environment Variables** に `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_GOOGLE_CLIENT_ID` を設定し、Deploy します。
4. （任意）**Environment Variables** に `CRON_SECRET`（ランダムな長い文字列）を設定すると、
   Supabase の停止を防ぐ定期アクセス（`/api/cron/keepalive`、`vercel.json` で1日1回）を Vercel Cron 以外から呼べなくなります。
5. 誕生日の通知（Web Push）を使う場合は、次の環境変数も設定します（値の作り方は `.env.local.example` を参照）。
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`：`npx web-push generate-vapid-keys` で作成
   - `VAPID_SUBJECT`：通知の送り主の連絡先（`mailto:` で始まるメールアドレスか、アプリの URL）
   - `SUPABASE_SERVICE_ROLE_KEY`：Supabase の **Project Settings → API** の service_role キー。**絶対に公開しない**こと
   あわせて Supabase の SQL Editor で `supabase/migrations/20261003_add_push_subscriptions.sql` を実行します。
   通知は `vercel.json` の Cron で、前日19時ごろ（`/api/cron/notify-eve`）と当日8時ごろ（`/api/cron/notify-morning`）に送られます。
6. Supabase の **Authentication → URL Configuration** を次のとおり設定します。
   - **Site URL**：`https://<あなたのアプリ>.vercel.app`
   - **Redirect URLs**：`https://<あなたのアプリ>.vercel.app/**` を追加

### 5. 管理者を設定する（任意）

自分でログインして参加したあと、**Table Editor → members** で自分の行の `is_admin` を `true` にします。
管理者は、不適切な寄せ書きを削除できるようになります。

---

## 公開前チェックリスト

- [ ] スマホ（iPhone Safari・Android Chrome）で、ログイン → 招待コード → プロフィール登録まで通るか
- [ ] 写真のアップロードができるか（iPhoneの写真も含む）
- [ ] 2つ目のGoogleアカウントで参加し、共通点が表示されるか
- [ ] 誕生日を「今日」にしたテスト用アカウントで、寄せ書きの書き込み・削除ができるか
- [ ] 招待コードなしで `/` を開いても中身が見えないか
- [ ] 研修担当者にサービスの内容を共有したか

## フォルダ構成

```text
supabase/schema.sql          DB・権限（RLS）・写真保存の設定
src/middleware.ts            未ログイン時にログイン画面へ送る
src/lib/                     Supabase接続、誕生日計算、共通点判定
src/app/actions.ts           保存・削除などのサーバー処理
src/app/(app)/               ログイン後の画面（下部タブあり）
src/app/login, join, onboarding  ログイン前後の画面
src/components/              プロフィールフォーム・アバターなど
public/icons/                ホーム画面用アイコン
```

## 設定を変えたいとき

`src/lib/constants.ts` で変更できます。

- 寄せ書きを書ける期間：`MESSAGE_WINDOW_DAYS`（初期値 7日）
- 「もうすぐ誕生日」の表示日数：`UPCOMING_DAYS`
- 趣味タグの候補：`HOBBY_SUGGESTIONS`

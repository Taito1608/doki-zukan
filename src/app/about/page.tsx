import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { Arrow, SectionHeading, btnPrimary } from "@/components/ui";
import { MESSAGE_WINDOW_DAYS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "同期図鑑とは｜使い方・注意事項",
  description: "同期図鑑のサービス内容、はじめ方、Googleログインと個人情報の扱い、利用上のお願い",
};

// ログインしていなくても見られる紹介ページ。アプリを触る前に読んでもらう想定

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "user",
    title: "プロフィール",
    body: "顔写真と名前、出身地、趣味、職種、一言で、同期がどんな人かがわかります。",
  },
  {
    icon: "sparkles",
    title: "共通点",
    body: "同じ出身地・趣味・誕生月・職種など、あなたとの共通点が自動で表示されます。",
  },
  {
    icon: "cake",
    title: "誕生日の寄せ書き",
    body: `誕生日の前後${MESSAGE_WINDOW_DAYS}日間、同期がお祝いの一言を書けます。本人には当日まで内緒です。`,
  },
];

const STEPS = [
  { title: "アプリを開く", body: "共有されたURLを、スマホは Safari（iPhone）か Chrome（Android）、パソコンは Chrome・Edge・Safari などで開きます。" },
  { title: "Googleでログイン", body: "ふだん使っている Google アカウントを選びます。" },
  { title: "招待コードを入力", body: "同期に共有された招待コードを入力します。" },
  { title: "プロフィールを作る", body: "名前と読み仮名（ローマ字）以外はすべて任意です。3分ほどで終わり、あとから変更できます。" },
  { title: "ホーム画面に追加", body: "アプリのようにすぐ開けるようになります（下の手順を参照）。パソコンはブックマークでも大丈夫です。" },
];

const NOTIFICATIONS = [
  {
    when: "前日 19時ごろ",
    title: "明日は〇〇さんの誕生日です！",
    body: "同期の誕生日の前日に、みんなにお知らせします。",
  },
  {
    when: "当日 8時ごろ",
    title: "今日は〇〇さんの誕生日です！",
    body: "まだ寄せ書きを書いていない人にだけお知らせします。",
  },
  {
    when: "当日 8時ごろ",
    title: "お誕生日おめでとうございます！",
    body: "誕生日の本人に、届いた寄せ書きの件数をお知らせします。",
  },
];

const NOTIFICATION_TROUBLE = [
  {
    device: "iPhone",
    fix: "「設定」アプリ →「通知」→「同期図鑑」で「通知を許可」をオンにします。ホーム画面に追加していない場合は、先に追加してください。",
  },
  {
    device: "Android",
    fix: "Chrome のアドレスバー左のアイコン →「権限」→「通知」を許可します。または「設定」→「アプリ」→「Chrome」→「通知」をオンにします。",
  },
  {
    device: "PC",
    fix: "アドレスバー左の鍵（または設定）のアイコン →「通知」を「許可」にします。あわせてパソコン本体の通知設定も確認してください。",
  },
];

const PRIVACY: { icon: IconName; title: string; body: React.ReactNode }[] = [
  {
    icon: "lock",
    title: "パスワードは登録されません",
    body: "ログインは Google が行います。このアプリにパスワードが保存されることはありません。",
  },
  {
    icon: "mail",
    title: "Google から受け取る情報",
    body: (
      <>
        受け取るのは <b>名前・メールアドレス・アカウントの識別番号</b> だけです。名前はプロフィールの初期値に使うだけで、変更できます。
        Gmail・カレンダー・連絡先・Google のプロフィール写真にはアクセスしません。
      </>
    ),
  },
  {
    icon: "eye",
    title: "メールアドレスの扱い",
    body: (
      <>
        メールアドレスが<b>ほかの同期に表示されることはありません</b>。
        ログインの仕組み上、ログイン情報を管理するサービス（Supabase）に保存され、開発者は管理画面で確認できる状態にありますが、
        <b>ログインする人を見分けるためだけに使い</b>、連絡や宣伝などに使うことはありません。
      </>
    ),
  },
  {
    icon: "users",
    title: "見られるのは同期だけ",
    body: "プロフィールや寄せ書きを見られるのは、招待コードで参加した同期だけです。ログインしていない人や外部の人には表示されません。寄せ書きは参加している同期全員が読めます。",
  },
  {
    icon: "cake",
    title: "必要最小限の情報だけ",
    body: "誕生日は月日だけを登録し、年（年齢）は保存しません。名前と読み仮名以外の項目はすべて任意で、入力しなくても使えます。",
  },
  {
    icon: "trash",
    title: "いつでも退会できます",
    body: "「マイページ → プロフィールを編集 → アカウントを削除する」から退会すると、プロフィール・写真・寄せ書き・ログイン情報（メールアドレスを含む）がすべて削除されます。",
  },
];

const RULES = [
  "招待コードは、同期以外に共有しないでください。",
  "人を傷つける書き込みや、本人の同意のない写真の使用はやめてください。",
  "アプリ内の情報（プロフィールや寄せ書き）を、スクリーンショットなどで外部に持ち出さないでください。",
  "不適切な寄せ書きは、書いた本人と、書かれた本人が削除できます。",
  "このアプリは同期が個人で開発したもので、会社の公式サービスではありません。",
  "内容は予告なく変更したり、提供を終了したりすることがあります。",
];

const FAQ = [
  { q: "お金はかかりますか？", a: "無料です。" },
  {
    q: "誕生日の通知は届きますか？",
    a: "届きます。通知をオンにすると、誕生日の前日19時ごろと、当日8時ごろ（まだ寄せ書きを書いていない場合）にお知らせします。iPhone・Android・PC それぞれの設定方法は、このページの「誕生日の通知」を見てください。",
  },
  { q: "パソコンでも使えますか？", a: "使えます。パソコンのブラウザで同じURLを開き、同じ Google アカウントでログインしてください（「すぐ開けるようにする」の PC の手順も参照）。" },
  { q: "名前や写真を変えたいです", a: "「マイページ → プロフィールを編集」からいつでも変更できます。" },
  {
    q: "Googleのログインができません",
    a: "LINE などのアプリの中で開いていると、Google のログインができないことがあります。右上のメニューから「ブラウザで開く」を選び、Safari か Chrome で開き直してください。",
  },
];

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`cut bg-panel p-5 ${className}`}>{children}</div>;
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-16">
      {/* トップ */}
      <header className="text-center">
        <div className="cut mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-brand-500 text-white">
          <Icon name="book" size={36} strokeWidth={1.75} />
        </div>
        <p className="text-xs font-semibold tracking-[0.3em] text-brand-600">DOKI ZUKAN</p>
        <h1 className="mt-1 text-3xl font-bold">同期図鑑</h1>
        <p className="mt-4 leading-relaxed text-stone-600">
          お互いの共通点を知って、
          <br />
          同期ともっと仲良くなろう。
        </p>
        <Link href="/" className={`${btnPrimary} mx-auto mt-8 max-w-sm`}>
          アプリをはじめる
          <Arrow />
        </Link>
      </header>

      <div className="mt-14 space-y-14">
        {/* どんなサービス？ */}
        <section className="border-t border-stone-200 pt-10">
          <SectionHeading en="ABOUT">どんなサービス？</SectionHeading>
          <p className="leading-relaxed text-stone-700">
            同期がたくさんいると、「顔と名前が一致しない」「話す相手がいつも同じ」になりがちで、配属後は会う機会も減っていきます。
            同期図鑑は、<b>同期のことを知り、お互いに話しかけるきっかけを作る</b>ための、同期だけの図鑑です。
          </p>
          <ul className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <Panel className="flex gap-4">
                  <Icon name={f.icon} size={24} className="mt-0.5 text-brand-500" />
                  <div>
                    <p className="font-bold">{f.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{f.body}</p>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-stone-600">
            チャットやランキングはありません。アプリの中で長く過ごすためではなく、研修や懇親会、ふだんの連絡で<b>話しかけるきっかけ</b>を作るためのアプリです。
          </p>
        </section>

        {/* はじめ方 */}
        <section className="border-t border-stone-200 pt-10">
          <SectionHeading en="HOW TO START">はじめ方</SectionHeading>
          <ol className="divide-y divide-stone-200 border-y border-stone-200">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 py-4">
                <span className="w-7 shrink-0 text-2xl leading-none font-semibold text-brand-500">{i + 1}</span>
                <div>
                  <p className="font-bold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-10 mb-4 text-lg font-bold">すぐ開けるようにする</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Panel className="border-b-[3px] border-brand-500">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">iPhone</p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                <li>
                  1. <b>Safari</b> でアプリを開きます
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  2. 画面下の <Icon name="share" size={18} className="text-brand-600" /> <b>共有ボタン</b> をタップ
                </li>
                <li>
                  3. 「<b>ホーム画面に追加</b>」→「<b>追加</b>」をタップ
                </li>
              </ol>
            </Panel>
            <Panel className="border-b-[3px] border-brand-500">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">Android</p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                <li>
                  1. <b>Chrome</b> でアプリを開きます
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  2. 右上の <Icon name="more" size={18} className="text-brand-600" /> <b>メニュー</b> をタップ
                </li>
                <li>
                  3. 「<b>ホーム画面に追加</b>」または「<b>アプリをインストール</b>」をタップ
                </li>
              </ol>
            </Panel>
            <Panel className="border-b-[3px] border-brand-500 sm:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">PC</p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed">
                <li>
                  <b>Chrome・Edge</b>：アドレスバーの右端に出る <b>インストール</b> のアイコンを押すと、アプリとして開けるようになります。
                </li>
                <li>
                  <b>Safari（Mac）</b>：メニューバーの「<b>ファイル</b>」→「<b>Dockに追加</b>」を選びます。
                </li>
                <li>
                  そのほかのブラウザでは、<b>ブックマーク</b>に登録しておくと便利です。
                </li>
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                ログインや使い方はスマホと同じです。スマホとパソコンで同じ Google アカウントを使えば、同じプロフィールで使えます。
              </p>
            </Panel>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            ※ LINE などのアプリの中で開くと、Google のログインができないことがあります。右上のメニューから「ブラウザで開く」を選んでください。
          </p>
        </section>

        {/* 誕生日の通知 */}
        <section id="notification" className="scroll-mt-6 border-t border-stone-200 pt-10">
          <SectionHeading en="NOTIFICATION">誕生日の通知</SectionHeading>
          <p className="leading-relaxed text-stone-700">
            通知をオンにすると、同期の誕生日をお知らせします。前日のうちに寄せ書きを書いておくと、当日の朝に本人に届きます。
          </p>
          <ul className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
            {NOTIFICATIONS.map((n) => (
              <li key={n.title} className="flex gap-4 py-3.5 text-sm leading-relaxed">
                <span className="w-24 shrink-0 font-bold text-brand-600">{n.when}</span>
                <span>
                  <b>{n.title}</b>
                  <span className="block text-stone-600">{n.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 mb-4 text-lg font-bold">通知をオンにする</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Panel className="border-b-[3px] border-brand-500">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">iPhone</p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                <li>
                  1. 先に<b>ホーム画面に追加</b>します（上の「すぐ開けるようにする」を参照）
                </li>
                <li>
                  2. ホーム画面の<b>同期図鑑のアイコン</b>から開きます
                </li>
                <li>
                  3. ホームの「<b>通知をオンにする</b>」をタップします
                </li>
                <li>
                  4. 通知の確認が出たら「<b>許可</b>」をタップします
                </li>
              </ol>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                iOS 16.4 以降が必要です。Safari のタブのままでは設定できません。
              </p>
            </Panel>
            <Panel className="border-b-[3px] border-brand-500">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">Android</p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                <li>
                  1. <b>Chrome</b> でアプリを開きます（ホーム画面に追加したアイコンからでも大丈夫です）
                </li>
                <li>
                  2. ホームの「<b>通知をオンにする</b>」をタップします
                </li>
                <li>
                  3. 通知の確認が出たら「<b>許可</b>」をタップします
                </li>
              </ol>
            </Panel>
            <Panel className="border-b-[3px] border-brand-500 sm:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">PC</p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                <li>
                  1. <b>Chrome・Edge・Firefox・Safari（Mac）</b>でアプリを開きます
                </li>
                <li>
                  2. ホームの「<b>通知をオンにする</b>」を押します
                </li>
                <li>
                  3. ブラウザに通知の確認が出たら「<b>許可</b>」を押します
                </li>
              </ol>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                ブラウザを閉じていると届かないことがあります。Chrome・Edge は、アプリとしてインストールしておくと届きやすくなります。
                パソコン本体の通知がオフだと表示されないので、Mac は「システム設定 → 通知」、Windows は「設定 → システム → 通知」でブラウザの通知を許可してください。
              </p>
            </Panel>
          </div>

          <h3 className="mt-10 mb-4 text-lg font-bold">うまくいかないとき</h3>
          <ul className="divide-y divide-stone-200 border-y border-stone-200 text-sm leading-relaxed">
            {NOTIFICATION_TROUBLE.map((t) => (
              <li key={t.device} className="flex gap-4 py-3.5">
                <span className="w-20 shrink-0 font-bold">{t.device}</span>
                <span className="text-stone-600">{t.fix}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            通知は端末ごとの設定です。スマホとパソコンで別々にオン・オフでき、「マイページ → プロフィールを編集 → 通知」からいつでもオフにできます。
            通知には同期の名前が表示されるので、ロック画面の表示が気になる場合は端末の設定で調整してください。
          </p>
        </section>

        {/* Googleログインと個人情報 */}
        <section className="border-t border-stone-200 pt-10">
          <SectionHeading en="PRIVACY">Googleログインと個人情報</SectionHeading>
          <ul className="space-y-3">
            {PRIVACY.map((p) => (
              <li key={p.title}>
                <Panel className="flex gap-4">
                  <Icon name={p.icon} size={22} className="mt-0.5 text-brand-500" />
                  <div>
                    <p className="font-bold">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{p.body}</p>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        </section>

        {/* 利用上のお願い */}
        <section className="border-t border-stone-200 pt-10">
          <SectionHeading en="RULES">利用上のお願い</SectionHeading>
          <p className="mb-4 text-sm text-stone-600">利用をはじめた時点で、次の内容に同意したものとします。</p>
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {RULES.map((r) => (
              <li key={r} className="flex gap-3 py-3.5 text-sm leading-relaxed">
                <Arrow className="mt-1.5 text-brand-500" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* よくある質問 */}
        <section className="border-t border-stone-200 pt-10">
          <SectionHeading en="FAQ">よくある質問</SectionHeading>
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="mr-2 font-semibold text-brand-500">Q.</span>
                    {f.q}
                  </span>
                  <Arrow className="rotate-90 text-stone-400 transition group-open:-rotate-90" />
                </summary>
                <p className="mt-3 pl-6 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 問い合わせ */}
        <section className="border-t border-stone-200 pt-10">
          <SectionHeading en="CONTACT">お問い合わせ</SectionHeading>
          <p className="text-sm leading-relaxed text-stone-600">
            不具合や「こんな機能がほしい」という要望は、Slack で気軽に教えてください。
          </p>
        </section>

        <Link href="/" className={`${btnPrimary} mx-auto max-w-sm`}>
          アプリをはじめる
          <Arrow />
        </Link>
      </div>
    </main>
  );
}

-- 配属先・配属希望の項目を廃止し、登録済みのデータも削除する
-- アプリの新しいバージョンをデプロイした後に実行すること（旧バージョンはこの列に書き込むため）
alter table public.profiles drop column if exists department;

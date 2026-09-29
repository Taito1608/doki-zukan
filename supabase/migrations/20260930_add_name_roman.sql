-- 名前の読み（ローマ字）を追加する
-- アプリの新しいバージョンをデプロイする前に実行すること（新しいバージョンはこの列に書き込むため）
alter table public.profiles
  add column if not exists name_roman text
  check (name_roman ~ '^[A-Za-z][A-Za-z .''-]{0,39}$');

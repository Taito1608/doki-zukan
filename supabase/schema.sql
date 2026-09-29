-- =========================================================
-- 同期図鑑 データベース定義
-- Supabase の SQL Editor に貼り付けて、まとめて実行してください。
-- =========================================================

-- ---------------------------------------------------------
-- テーブル
-- ---------------------------------------------------------

-- 招待コード（同期以外の登録を防ぐ）
create table if not exists public.invite_codes (
  code        text primary key,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 同期メンバー（招待コードを通過したユーザー）
create table if not exists public.members (
  id          uuid primary key references auth.users(id) on delete cascade,
  is_admin    boolean not null default false,
  joined_at   timestamptz not null default now()
);

-- プロフィール
create table if not exists public.profiles (
  id            uuid primary key references public.members(id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 30),
  -- 名前の読み（ローマ字）。例：Taro Yamada
  name_roman    text check (name_roman ~ '^[A-Za-z][A-Za-z .''-]{0,39}$'),
  photo_path    text,
  job_type      text,
  hometown      text,
  hobbies       text[] not null default '{}',
  birth_month   smallint check (birth_month between 1 and 12),
  birth_day     smallint check (birth_day between 1 and 31),
  message       text check (char_length(message) <= 100),
  updated_at    timestamptz not null default now(),
  -- 誕生日は「月日の両方」か「両方なし」のどちらか。年は保存しない
  constraint birthday_pair check ((birth_month is null) = (birth_day is null))
);

-- 寄せ書き（1人の誕生日につき、1人1年1件。書き直しは上書き）
create table if not exists public.birthday_messages (
  id            uuid primary key default gen_random_uuid(),
  to_user_id    uuid not null references public.members(id) on delete cascade,
  from_user_id  uuid not null references public.members(id) on delete cascade,
  year          smallint not null,
  body          text not null check (char_length(body) between 1 and 200),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint one_message_per_year unique (to_user_id, from_user_id, year),
  constraint not_to_self check (to_user_id <> from_user_id)
);

create index if not exists birthday_messages_to_idx
  on public.birthday_messages (to_user_id, year);

-- ---------------------------------------------------------
-- ヘルパー関数
-- ---------------------------------------------------------

create or replace function public.is_member()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.members where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.members where id = auth.uid() and is_admin);
$$;

-- 招待コードで同期メンバーになる
create or replace function public.join_with_invite(p_code text)
returns boolean
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if not exists (
    select 1 from public.invite_codes
    where upper(code) = upper(trim(p_code)) and is_active
  ) then
    return false;
  end if;

  insert into public.members (id) values (auth.uid())
  on conflict (id) do nothing;

  return true;
end;
$$;

-- 自分のアカウントとデータをすべて削除する
create or replace function public.delete_my_account()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  -- 写真ファイルの削除はアプリ側で先に行う
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.join_with_invite(text) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.join_with_invite(text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------
-- 行レベルセキュリティ（同期メンバーだけが読める）
-- ---------------------------------------------------------

alter table public.invite_codes      enable row level security;
alter table public.members           enable row level security;
alter table public.profiles          enable row level security;
alter table public.birthday_messages enable row level security;

-- invite_codes: クライアントからは一切触れない（join_with_invite 経由のみ）

-- members
drop policy if exists "members: 自分の行は読める" on public.members;
create policy "members: 自分の行は読める"
  on public.members for select to authenticated
  using (id = auth.uid() or public.is_member());

-- profiles
drop policy if exists "profiles: 同期は読める" on public.profiles;
create policy "profiles: 同期は読める"
  on public.profiles for select to authenticated
  using (public.is_member());

drop policy if exists "profiles: 自分の分を作成" on public.profiles;
create policy "profiles: 自分の分を作成"
  on public.profiles for insert to authenticated
  with check (id = auth.uid() and public.is_member());

drop policy if exists "profiles: 自分の分を更新" on public.profiles;
create policy "profiles: 自分の分を更新"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- birthday_messages
drop policy if exists "messages: 同期は読める" on public.birthday_messages;
create policy "messages: 同期は読める"
  on public.birthday_messages for select to authenticated
  using (public.is_member());

drop policy if exists "messages: 自分名義で書く" on public.birthday_messages;
create policy "messages: 自分名義で書く"
  on public.birthday_messages for insert to authenticated
  with check (
    from_user_id = auth.uid()
    and public.is_member()
    and year between extract(year from now())::int - 1 and extract(year from now())::int + 1
  );

drop policy if exists "messages: 自分の書き込みを編集" on public.birthday_messages;
create policy "messages: 自分の書き込みを編集"
  on public.birthday_messages for update to authenticated
  using (from_user_id = auth.uid())
  with check (from_user_id = auth.uid());

drop policy if exists "messages: 書いた人・本人・管理者は削除できる" on public.birthday_messages;
create policy "messages: 書いた人・本人・管理者は削除できる"
  on public.birthday_messages for delete to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------
-- 写真の保存先（非公開バケット。同期だけが署名付きURLで閲覧）
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

drop policy if exists "avatars: 同期は読める" on storage.objects;
create policy "avatars: 同期は読める"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and public.is_member());

drop policy if exists "avatars: 自分のフォルダにアップロード" on storage.objects;
create policy "avatars: 自分のフォルダにアップロード"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_member()
  );

drop policy if exists "avatars: 自分の写真を更新" on storage.objects;
create policy "avatars: 自分の写真を更新"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars: 自分の写真を削除" on storage.objects;
create policy "avatars: 自分の写真を削除"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------
-- 初期データ（招待コードは自由に変更してください）
-- ---------------------------------------------------------

insert into public.invite_codes (code) values ('DOKI2027')
on conflict (code) do nothing;

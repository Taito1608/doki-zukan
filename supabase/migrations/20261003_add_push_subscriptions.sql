-- 誕生日の通知（Web Push）の送り先。1人が複数の端末で受け取れるよう、端末ごとに1行
create table if not exists public.push_subscriptions (
  endpoint    text primary key,
  user_id     uuid not null references public.members(id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- 自分の端末の分だけ見る・登録する・解除できる（送信はサーバーが service role で行う）
drop policy if exists "push: 自分の分は読める" on public.push_subscriptions;
create policy "push: 自分の分は読める"
  on public.push_subscriptions for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "push: 自分の端末を登録" on public.push_subscriptions;
create policy "push: 自分の端末を登録"
  on public.push_subscriptions for insert to authenticated
  with check (user_id = auth.uid() and public.is_member());

drop policy if exists "push: 自分の端末を更新" on public.push_subscriptions;
create policy "push: 自分の端末を更新"
  on public.push_subscriptions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "push: 自分の端末を解除" on public.push_subscriptions;
create policy "push: 自分の端末を解除"
  on public.push_subscriptions for delete to authenticated
  using (user_id = auth.uid());

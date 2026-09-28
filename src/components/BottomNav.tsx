"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

/** path がそのページかその配下か（"/me" が "/members" に一致しないよう区切りで判定する） */
function isUnder(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function BottomNav({ myId }: { myId: string }) {
  const pathname = usePathname();
  const isMine = isUnder(pathname, `/members/${myId}`) || isUnder(pathname, "/me");
  const items: { href: string; label: string; icon: IconName; active: boolean }[] = [
    { href: "/", label: "ホーム", icon: "home", active: pathname === "/" },
    {
      href: "/members",
      label: "同期",
      icon: "users",
      active: isUnder(pathname, "/members") && !isMine,
    },
    {
      href: `/members/${myId}`,
      label: "マイページ",
      icon: "user",
      active: isMine,
    },
  ];

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {items.map((it) => (
          <li key={it.href} className="flex-1">
            <Link
              href={it.href}
              className={`flex flex-col items-center gap-1 pt-2 pb-1 text-xs ${
                it.active ? "font-bold text-brand-600" : "text-stone-500"
              }`}
            >
              <TabContent icon={it.icon} label={it.label} active={it.active} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** タップ直後から読み込みが終わるまで、そのタブのアイコンを点滅させる */
function TabContent({ icon, label, active }: { icon: IconName; label: string; active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <Icon name={icon} size={24} strokeWidth={active ? 2.25 : 1.75} className={pending ? "animate-pulse" : ""} />
      {label}
    </>
  );
}

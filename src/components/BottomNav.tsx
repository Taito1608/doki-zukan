"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

export function BottomNav({ myId }: { myId: string }) {
  const pathname = usePathname();
  const items: { href: string; label: string; icon: IconName; active: boolean }[] = [
    { href: "/", label: "ホーム", icon: "home", active: pathname === "/" },
    {
      href: "/members",
      label: "同期",
      icon: "users",
      active: pathname.startsWith("/members") && !pathname.startsWith(`/members/${myId}`),
    },
    {
      href: `/members/${myId}`,
      label: "マイページ",
      icon: "user",
      active: pathname.startsWith(`/members/${myId}`) || pathname.startsWith("/me"),
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
              <Icon name={it.icon} size={24} strokeWidth={it.active ? 2.25 : 1.75} />
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

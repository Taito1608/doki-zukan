"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({ myId }: { myId: string }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "ホーム", icon: "🏠", active: pathname === "/" },
    {
      href: "/members",
      label: "同期",
      icon: "👥",
      active: pathname.startsWith("/members") && !pathname.startsWith(`/members/${myId}`),
    },
    {
      href: `/members/${myId}`,
      label: "マイページ",
      icon: "🙂",
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
              className={`flex flex-col items-center gap-0.5 pt-2 pb-1 text-xs ${
                it.active ? "font-bold text-brand-600" : "text-stone-500"
              }`}
            >
              <span className="text-2xl leading-none">{it.icon}</span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

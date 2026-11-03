"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Item = { label: string; href: string };

// A details element opens without JavaScript. With it, the menu also closes after a tap, on Escape and on an outside tap.
export function PhoneMenu({ items, className }: { items: Item[]; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const menu = ref.current;
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    };
    const onKey = (event: KeyboardEvent) => {
      const menu = ref.current;
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details ref={ref} className={className}>
      <summary>Menu</summary>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => {
                if (ref.current) ref.current.open = false;
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

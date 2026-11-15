"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { PhoneIcon } from "./Icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu after navigating (adjust state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-turf text-ground">
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <Image src="/images/logo-white.png" alt="" width={44} height={48} className="h-11 w-auto" priority />
          <span className="leading-none">
            <span className="block font-display text-[1.35rem] font-bold tracking-tight">PBC Lawn Service</span>
            <span className="block text-[0.8rem] text-ground/75">Perfection by Cooper</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-[0.98rem] font-medium transition-colors hover:bg-ground/10 ${
                pathname.startsWith(item.href) ? "text-gold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a href={site.phoneHref} className="ml-2 flex items-center gap-2 px-3 py-2 font-semibold hover:text-gold">
            <PhoneIcon className="size-4" />
            {site.phone}
          </a>
          <Link href="/quote" className="btn btn-gold ml-2">
            Free quote
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a href={site.phoneHref} className="btn btn-ghost-light !min-h-11 !px-3" aria-label={`Call ${site.phone}`}>
            <PhoneIcon className="size-5" />
          </a>
          <button
            type="button"
            className="btn btn-ghost-light !min-h-11 !px-4"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-[4.5rem] bottom-0 overflow-y-auto bg-turf lg:hidden"
      >
        <nav aria-label="Mobile" className="wrap flex flex-col gap-1 py-6">
          {[{ href: "/", label: "Home" }, ...nav].map((item) => (
            <Link key={item.href} href={item.href} className="py-3 font-display text-3xl font-bold">
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn btn-gold mt-6 w-full text-lg">
            Get a free quote
          </Link>
          <a href={site.phoneHref} className="btn btn-ghost-light mt-3 w-full text-lg">
            Call {site.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}

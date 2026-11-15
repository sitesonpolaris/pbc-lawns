import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Customer Login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-turf lg:block">
        <Image src="/images/stripes-truck.webp" alt="" fill sizes="50vw" className="object-cover opacity-90" priority />
      </div>
      <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="" width={40} height={44} className="h-11 w-auto" />
          <span className="font-display text-xl font-bold">PBC Lawn Service</span>
        </Link>
        <div className="my-auto w-full max-w-md py-12">
          <Suspense fallback={<div className="h-96" />}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-sm text-muted">
          Trouble signing in? Call <a href="tel:+17042190676" className="underline">(704) 219-0676</a>.
        </p>
      </div>
    </main>
  );
}

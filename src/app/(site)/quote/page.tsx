import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Free Lawn Care Quote",
  description: "Request a free lawn care quote from PBC Lawn Service in the Charlotte area, or call (704) 219-0676.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <section className="py-16 md:py-24">
      <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="reveal text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95]">Get a free quote.</h1>
          <p className="reveal mt-6 max-w-[30rem] text-xl text-muted" style={{ ["--d" as string]: "80ms" }}>
            Tell us about your yard. Cooper will follow up, usually within one business day, with a price written for
            your property.
          </p>
          <div className="reveal mt-8 rounded-2xl bg-turf p-6 text-ground" style={{ ["--d" as string]: "140ms" }}>
            <p className="text-ground/80">Rather talk it through?</p>
            <a href={site.phoneHref} className="mt-1 block font-display text-3xl font-bold hover:text-gold">{site.phone}</a>
            <a href={`mailto:${site.email}`} className="mt-2 block break-all text-ground/85 hover:text-ground">{site.email}</a>
          </div>
          <div className="reveal relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block" style={{ ["--d" as string]: "200ms" }}>
            <Image src="/images/stripes-backyard.webp" alt="Freshly striped backyard lawn" fill sizes="35vw" className="object-cover" />
          </div>
        </div>
        <div>
          <Suspense fallback={<div className="h-[40rem] rounded-2xl bg-mist" />}>
            <QuoteForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

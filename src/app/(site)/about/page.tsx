import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "@/components/Icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About PBC: Perfection by Cooper",
  description: "PBC stands for Perfection by Cooper: an affordable Charlotte-area lawn service that puts quality over quantity.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="pt-20 pb-20 md:pt-28 md:pb-32">
        <div className="wrap grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <div>
            <Crown className="reveal h-9 w-auto text-gold-deep" />
            <h1 className="reveal mt-6 text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.95]" style={{ ["--d" as string]: "60ms" }}>
              Perfection by Cooper.
            </h1>
            <p className="reveal mt-8 max-w-[36rem] text-xl leading-relaxed md:text-2xl" style={{ ["--d" as string]: "120ms" }}>
              PBC started with one idea: a lawn service should be judged by how the yard looks when the truck pulls
              away. So we take fewer yards and finish each one properly.
            </p>
          </div>
          <div className="reveal relative aspect-[4/5] overflow-hidden rounded-2xl" style={{ ["--d" as string]: "160ms" }}>
            <Image src="/images/stripes-mower.webp" alt="Stand-on mower on a freshly striped backyard" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority />
          </div>
        </div>
      </section>

      <section className="stripes py-24 text-ground md:py-32">
        <div className="wrap grid gap-12 md:grid-cols-3">
          {[
            ["Quality over quantity", "Every yard gets a full finish: cut, edged, trimmed and blown clean. No rushing to the next stop."],
            ["Affordable on purpose", "You get a quote written for your property. No packages padded with things your yard doesn’t need."],
            ["More than mowing", "Not your typical lawn service, more like a lawn beautician: beds, planting, walls, treatments and pressure washing."],
          ].map(([t, d], i) => (
            <div key={t} className="reveal" style={{ ["--d" as string]: `${i * 80}ms` }}>
              <h2 className="text-[clamp(1.8rem,3vw,2.6rem)]">{t}</h2>
              <p className="mt-4 text-lg text-ground/90">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="reveal relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image src="/images/pressure-wash.webp" alt="PBC crew member pressure washing a driveway" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.5rem)]">Talk to Cooper.</h2>
            <p className="reveal mt-6 max-w-[32rem] text-xl text-muted" style={{ ["--d" as string]: "80ms" }}>
              Questions about your yard, a one-time cleanup, or ongoing service? Reach out and you&rsquo;ll hear back
              from the owner.
            </p>
            <dl className="reveal mt-8 space-y-4 text-lg" style={{ ["--d" as string]: "140ms" }}>
              <div>
                <dt className="font-semibold">Phone</dt>
                <dd><a className="underline decoration-gold decoration-2 underline-offset-4" href={site.phoneHref}>{site.phone}</a></dd>
              </div>
              <div>
                <dt className="font-semibold">Email</dt>
                <dd><a className="break-all underline decoration-gold decoration-2 underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a></dd>
              </div>
              <div>
                <dt className="font-semibold">Service area</dt>
                <dd>{site.area}</dd>
              </div>
            </dl>
            <Link href="/quote" className="reveal btn btn-gold mt-10 text-lg">Get a free quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}

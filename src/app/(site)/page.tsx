import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, CheckIcon, Crown, PhoneIcon } from "@/components/Icons";
import { WorkCompare } from "@/components/WorkCompare";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-turf text-ground">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div data-parallax="0.12" className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.12)" }}>
            <Image
              src="/images/hero-house.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_70%]"
            />
          </div>
          {/* Scrim so the headline stays readable over the photo */}
          <div className="absolute inset-0 bg-ink/45" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgb(12_14_11/0.75),transparent)]" />
        </div>

        <div className="wrap flex min-h-[calc(100svh-4.5rem)] flex-col justify-end pb-14 pt-32 md:pb-20">
          <Crown className="reveal mb-6 h-8 w-auto text-gold md:h-10" />
          <h1 className="reveal max-w-[14ch] text-[clamp(2.9rem,8.4vw,8rem)] leading-[0.92] tracking-[-0.035em]" style={{ ["--d" as string]: "80ms" }}>
            As close to perfect as a lawn gets.
          </h1>
          <p className="reveal mt-8 max-w-[38rem] text-lg text-ground/90 md:text-xl" style={{ ["--d" as string]: "160ms" }}>
            PBC Lawn Service, short for Perfection by Cooper, is affordable lawn care for {site.area} that puts
            quality over quantity. Every cut, edge and bed is done like it&rsquo;s our own front yard.
          </p>
          <div className="reveal mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: "240ms" }}>
            <Link href="/quote" className="btn btn-gold text-lg">
              Get a free quote <ArrowIcon className="size-5" />
            </Link>
            <a href={site.phoneHref} className="btn btn-ghost-light text-lg">
              <PhoneIcon className="size-5" /> {site.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Quality over quantity */}
      <section className="py-24 md:py-40">
        <div className="wrap grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="lg:pt-6">
            <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">Quality over quantity.</h2>
            <p className="reveal mt-8 max-w-[34rem] text-xl leading-relaxed md:text-2xl" style={{ ["--d" as string]: "80ms" }}>
              We would rather do fewer yards perfectly than more yards fast. That&rsquo;s the whole idea behind the
              name, and it&rsquo;s why our lawns stand out on the street.
            </p>
            <ul className="mt-12 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {[
                ["Stripes you can see from the road", "Lawns are cut in clean, straight passes that leave the striped finish PBC is known for."],
                ["Edges cut by hand", "Walks, drives and beds get a crisp line, not a quick pass with the trimmer."],
                ["Cleaned up before we leave", "Clippings are blown off every driveway, walk and patio, every visit."],
                ["Priced to stay affordable", "Each yard is quoted on its own, so you only pay for what your property needs."],
              ].map(([t, d], i) => (
                <li key={t} className="reveal" style={{ ["--d" as string]: `${120 + i * 70}ms` }}>
                  <CheckIcon className="size-7 text-stripe" />
                  <h3 className="mt-3 font-sans text-xl font-semibold tracking-normal">{t}</h3>
                  <p className="mt-2 text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <figure className="reveal relative" style={{ ["--d" as string]: "120ms" }}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src="/images/stripes-truck.webp"
                alt="PBC Lawn Service trailer and white pickup parked beside a freshly cross-striped lawn"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-muted">The PBC trailer on a Charlotte-area job.</figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------------------------------------------------- Before / after (live thing) */}
      <section className="stripes-turf py-24 text-ground md:py-36">
        <div className="wrap">
          <h2 className="reveal max-w-[18ch] text-[clamp(2.4rem,5.4vw,4.75rem)]">See the difference one visit makes.</h2>
          <div className="mt-12 md:mt-16">
            <WorkCompare />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Services */}
      <section className="py-24 md:py-40" aria-labelledby="services-h">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="services-h" className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">Everything your yard needs.</h2>
            <p className="reveal mt-6 max-w-[30rem] text-lg text-muted" style={{ ["--d" as string]: "80ms" }}>
              From the weekly cut to a full bed makeover. Every job is quoted for your property, so you only pay for
              what your yard needs.
            </p>
            <Link href="/services" className="reveal btn btn-ink mt-8" style={{ ["--d" as string]: "140ms" }}>
              All services <ArrowIcon className="size-5" />
            </Link>
          </div>
          <ul role="list" className="space-y-3">
            {services.map((s, i) => (
              <li key={s.slug} className="reveal" style={{ ["--d" as string]: `${i * 50}ms` }}>
                <Link
                  href={`/services#${s.slug}`}
                  className="group grid grid-cols-[5.5rem_1fr] items-center gap-5 rounded-2xl bg-mist p-3 pr-5 transition-colors hover:bg-mist-2 sm:grid-cols-[7.5rem_1fr_auto]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={s.image} alt="" fill sizes="120px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl tracking-tight md:text-[1.7rem]">{s.name}</h3>
                    <p className="mt-1 text-muted">{s.short}</p>
                  </div>
                  <ArrowIcon className="hidden size-6 text-stripe transition-transform group-hover:translate-x-1 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- Treatment program */}
      <section className="stripes py-24 text-ground md:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">Fed every 6–8 weeks.</h2>
            <p className="reveal mt-6 max-w-[32rem] text-xl text-ground/90" style={{ ["--d" as string]: "80ms" }}>
              Thick, even-colored grass comes from a steady program, not one bag of fertilizer in April. Your
              treatments are scheduled, and you can see the next one in your customer portal.
            </p>
            <Link href="/services#fertilization-weed-control" className="reveal btn btn-light mt-8" style={{ ["--d" as string]: "140ms" }}>
              About the program <ArrowIcon className="size-5" />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              ["Pre-emergent crabgrass control", "Stops crabgrass before it sprouts."],
              ["Broadleaf weed control", "Clears dandelions, clover and other broadleaf weeds."],
              ["Grub & surface insect treatment", "Protects the roots from below."],
              ["Disease treatment", "Handles brown patch and fungus when they show up."],
            ].map(([t, d], i) => (
              <li key={t} className="reveal rounded-2xl bg-turf/85 p-6" style={{ ["--d" as string]: `${i * 70}ms` }}>
                <h3 className="font-sans text-xl font-semibold tracking-normal text-gold">{t}</h3>
                <p className="mt-2 text-ground/85">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- Portal */}
      <section className="py-24 md:py-40">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <PortalFragment />
          <div>
            <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">Your lawn, on your phone.</h2>
            <p className="reveal mt-6 max-w-[32rem] text-xl text-muted" style={{ ["--d" as string]: "80ms" }}>
              Every PBC customer gets a portal. See when we&rsquo;re coming next, when your next treatment is due,
              your billing schedule, and pay invoices securely through Square.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "140ms" }}>
              <Link href="/portal" className="btn btn-ink">Customer login</Link>
              <Link href="/quote" className="btn bg-mist hover:bg-mist-2">Become a customer</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Photo wall */}
      <section className="bg-mist py-24 md:py-32" aria-labelledby="work-h">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="work-h" className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">Recent lawns.</h2>
            <Link href="/work" className="reveal btn btn-ink">See all our work <ArrowIcon className="size-5" /></Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              ["/images/stripes-mower.webp", "Striped backyard with the stand-on mower"],
              ["/images/bed-night.webp", "New bed with river-rock border and path lights at night"],
              ["/images/stripes-backyard.webp", "Freshly striped backyard"],
              ["/images/wall-3.webp", "Stacked-stone tree ring"],
            ].map(([src, alt], i) => (
              <div key={src} className="reveal relative aspect-[3/4] overflow-hidden rounded-xl" style={{ ["--d" as string]: `${i * 70}ms` }}>
                <Image src={src} alt={alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Service area / CTA */}
      <section className="py-24 md:py-36">
        <div className="wrap grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <h2 className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">Serving the Charlotte area.</h2>
            <p className="reveal mt-6 max-w-[34rem] text-xl text-muted" style={{ ["--d" as string]: "80ms" }}>
              Tell us about your yard and we&rsquo;ll get back to you with a free, no-pressure quote. Prefer to
              talk? Call or text Cooper directly.
            </p>
          </div>
          <div className="reveal flex flex-col gap-3" style={{ ["--d" as string]: "140ms" }}>
            <Link href="/quote" className="btn btn-gold text-lg">Get a free quote <ArrowIcon className="size-5" /></Link>
            <a href={site.phoneHref} className="btn btn-ink text-lg"><PhoneIcon className="size-5" /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}

/** A real fragment of the customer portal UI, filled with example data. */
function PortalFragment() {
  return (
    <div data-ui className="reveal relative mx-auto w-full max-w-md lg:order-first" aria-label="Example of the PBC customer portal">
      <div className="rounded-[2rem] bg-ink p-3">
        <div className="overflow-hidden rounded-[1.5rem] bg-ground">
          <div className="bg-turf px-5 py-4 text-ground">
            <p className="text-sm text-ground/70">Good morning, Dana</p>
            <p className="font-display text-2xl font-bold">Your lawn</p>
          </div>
          <div className="space-y-3 p-4">
            <div className="rounded-xl bg-white p-4">
              <p className="text-sm text-muted">Next visit</p>
              <p className="mt-1 text-lg font-semibold">Thursday · Mow, edge &amp; blow</p>
              <p className="text-sm text-muted">Arrival window 8–11 am</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-sm text-muted">Next treatment</p>
              <p className="mt-1 text-lg font-semibold">Round 4 · Broadleaf weed control</p>
              <p className="text-sm text-muted">In about 3 weeks</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white p-4">
              <div>
                <p className="text-sm text-muted">Invoice #1042</p>
                <p className="mt-1 text-lg font-semibold">$140.00 · due Fri</p>
              </div>
              <span className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink">Pay</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted">Example account shown.</p>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/Icons";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lawn Care Services",
  description:
    "Lawn maintenance, fertilization and weed control every 6–8 weeks, spring and fall cleanup, mulch and pine needles, planting, aeration and overseeding, retaining walls and pressure washing in the Charlotte area.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="stripes-turf pt-20 pb-20 text-ground md:pt-28 md:pb-28">
        <div className="wrap grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="reveal text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.95]">Lawn care services</h1>
            <p className="reveal mt-6 max-w-[36rem] text-xl text-ground/90" style={{ ["--d" as string]: "80ms" }}>
              Eight services, one standard. Prices vary by property, so every quote is written for your yard, and
              it&rsquo;s free.
            </p>
          </div>
          <nav aria-label="Jump to a service" className="reveal" style={{ ["--d" as string]: "140ms" }}>
            <ul className="flex flex-wrap gap-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <a href={`#${s.slug}`} className="inline-block rounded-full bg-ground/10 px-4 py-2 text-[0.95rem] hover:bg-ground/20">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="py-12 md:py-20">
        {services.map((s, i) => (
          <section key={s.slug} id={s.slug} className="scroll-mt-24 py-12 md:py-20" aria-labelledby={`${s.slug}-h`}>
            <div className={`wrap grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20`}>
              <div className={`reveal relative aspect-[4/3] overflow-hidden rounded-2xl ${i % 2 ? "lg:order-2" : ""}`}>
                <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
              <div>
                <h2 id={`${s.slug}-h`} className="reveal text-[clamp(2rem,4vw,3.5rem)]">{s.name}</h2>
                <p className="reveal mt-5 text-xl leading-relaxed" style={{ ["--d" as string]: "70ms" }}>{s.body}</p>
                <ul className="reveal mt-7 grid gap-3 sm:grid-cols-2" style={{ ["--d" as string]: "140ms" }}>
                  {s.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-lg">
                      <CheckIcon className="mt-1 size-5 shrink-0 text-stripe" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ ["--d" as string]: "200ms" }}>
                  <Link href={`/quote?service=${s.slug}`} className="btn btn-gold">
                    Quote this service <ArrowIcon className="size-5" />
                  </Link>
                  <p className="text-muted">
                    <span className="font-semibold text-ink">How often:</span> {s.cadence} · Price varies by property
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="bg-mist py-20 md:py-28">
        <div className="wrap flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[16ch] text-[clamp(2.2rem,5vw,4rem)]">Not sure what your yard needs?</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/quote" className="btn btn-gold text-lg">Get a free quote</Link>
            <a href={site.phoneHref} className="btn btn-ink text-lg">Call {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}

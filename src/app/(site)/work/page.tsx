import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BeforeAfter } from "@/components/BeforeAfter";
import { gallery, workPairs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Work: Before & After",
  description: "Real PBC Lawn Service jobs around Charlotte: striped lawns, trenched and mulched beds, tree rings and planting, before and after.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section className="pt-20 pb-12 md:pt-28">
        <div className="wrap">
          <h1 className="reveal max-w-[14ch] text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.95]">Our work, before and after.</h1>
          <p className="reveal mt-6 max-w-[38rem] text-xl text-muted" style={{ ["--d" as string]: "80ms" }}>
            Real yards, real jobs. Drag across each photo to see the same spot before PBC and after.
          </p>
        </div>
      </section>

      <section aria-label="Before and after comparisons" className="pb-24">
        <div className="wrap grid gap-x-8 gap-y-14 md:grid-cols-2">
          {workPairs.map((p, i) => (
            <figure key={p.id} className="reveal" style={{ ["--d" as string]: `${(i % 2) * 90}ms` }}>
              <BeforeAfter before={p.before} after={p.after} alt={p.alt} priority={i < 2} className="rounded-2xl" />
              <figcaption className="mt-4 font-display text-2xl font-bold tracking-tight">{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="stripes-turf py-24 text-ground md:py-32" aria-labelledby="gallery-h">
        <div className="wrap">
          <h2 id="gallery-h" className="reveal text-[clamp(2.4rem,5.4vw,4.75rem)]">From the field.</h2>
          <div className="mt-12 columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
            {gallery.map((g, i) => (
              <div key={g.src} className="reveal mb-3 break-inside-avoid overflow-hidden rounded-xl md:mb-4" style={{ ["--d" as string]: `${(i % 4) * 60}ms` }}>
                <Image src={g.src} alt={g.alt} width={g.w} height={g.h} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="h-auto w-full" />
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Link href="/quote" className="btn btn-gold text-lg">Get this for your yard</Link>
          </div>
        </div>
      </section>
    </>
  );
}

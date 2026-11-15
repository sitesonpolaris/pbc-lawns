import Link from "next/link";
import { services, site } from "@/lib/site";
import { Year } from "./Year";

export function Footer() {
  return (
    <footer className="mt-auto bg-turf text-ground">
      <div className="wrap pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-bold leading-tight md:text-4xl">
              Ready for the best-looking lawn on the street?
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/quote" className="btn btn-gold">
                Get a free quote
              </Link>
              <a href={site.phoneHref} className="btn btn-ghost-light">
                Call {site.phone}
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-sans text-base font-semibold tracking-normal text-gold">Services</h2>
            <ul className="mt-4 space-y-2 text-ground/85">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`} className="hover:text-ground">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-sans text-base font-semibold tracking-normal text-gold">Contact</h2>
            <ul className="mt-4 space-y-2 text-ground/85">
              <li>
                <a href={site.phoneHref} className="hover:text-ground">{site.phone}</a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="break-all hover:text-ground">{site.email}</a>
              </li>
              <li>Serving {site.area}</li>
              <li className="pt-3">
                <Link href="/portal" className="hover:text-ground">Customer login</Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-ground">Our work</Link>
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 select-none font-display text-[clamp(3.5rem,15vw,14rem)] font-bold leading-[0.8] tracking-[-0.045em] text-stripe-light"
        >
          Perfection by Cooper
        </p>

        <div className="mt-10 flex flex-col gap-2 text-sm text-ground/65 sm:flex-row sm:justify-between">
          <span>
            © <Year /> {site.name}. All rights reserved.
          </span>
          <span>
            Designed by{" "}
            <a
              href="https://www.sitesonpolaris.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition"
            >
              Sites on Polaris
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

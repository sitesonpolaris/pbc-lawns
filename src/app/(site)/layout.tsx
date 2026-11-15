import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteMotion } from "@/components/SiteMotion";
import { services, site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LandscapingBusiness",
  "@id": `${site.url}/#business`,
  name: site.name,
  alternateName: ["PBC Lawns", site.meaning],
  slogan: site.tagline,
  url: site.url,
  telephone: "+1-704-219-0676",
  email: site.email,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/images/logo.png`,
  priceRange: "$$",
  areaServed: { "@type": "City", name: "Charlotte", containedInPlace: { "@type": "State", name: "North Carolina" } },
  address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Lawn care services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, description: s.short },
    })),
  },
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <SiteMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

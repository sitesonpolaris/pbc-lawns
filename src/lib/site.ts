// Single source of truth for PBC Lawn Service business data.
// Items marked OWNER-CONFIRM need verification by Cooper before launch.

export const site = {
  name: "PBC Lawn Service",
  shortName: "PBC Lawns",
  meaning: "Perfection by Cooper",
  tagline: "Affordable lawn service that perfects quality over quantity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pbclawns.com",
  phone: "(704) 219-0676",
  phoneHref: "tel:+17042190676",
  email: "pbc.lawns@gmail.com",
  // OWNER-CONFIRM: exact towns served. Area inferred from the 704 area code and job photos.
  area: "Charlotte, NC and surrounding towns",
  areaShort: "Charlotte metro",
  city: "Charlotte",
  region: "NC",
  // OWNER-CONFIRM: hours are not published on the current site.
  hours: "Mon–Sat, by appointment",
  reviewUrl: "https://g.page/r/", // OWNER-CONFIRM: Google review link
} as const;

export type Service = {
  slug: string;
  name: string;
  short: string;
  body: string;
  includes: string[];
  cadence: string;
  image: string;
  imageAlt: string;
};

// Services exactly as offered on the current pbclawns.com. Pricing is quoted per property ("Price varies").
export const services: Service[] = [
  {
    slug: "lawn-maintenance",
    name: "Regular lawn maintenance",
    short: "Cut, edged, trimmed and blown clean on a schedule that suits your yard.",
    body: "Keep your lawn in tip-top shape while we handle the routine. Every visit gets the same finish: a clean cut, crisp edges along every walk and drive, trimmed borders, and hard surfaces blown clear before we leave.",
    includes: ["Cutting", "Edging", "Trimming", "Blowing"],
    cadence: "Weekly or every other week",
    image: "/images/stripes-mower.webp",
    imageAlt: "Freshly striped backyard lawn with a stand-on mower parked on the grass",
  },
  {
    slug: "fertilization-weed-control",
    name: "Fertilization & weed control",
    short: "A treatment program applied every 6–8 weeks through the growing season.",
    body: "A thick, even-colored lawn is fed, not just mowed. Treatments are scheduled every 6–8 weeks so weeds, crabgrass, grubs and disease are handled before they take hold.",
    includes: [
      "Broadleaf weed control",
      "Pre-emergent crabgrass control",
      "Grub and surface insect treatment",
      "Disease treatment",
    ],
    cadence: "Every 6–8 weeks",
    image: "/images/stripes-commercial.webp",
    imageAlt: "Dense, dark green striped lawn in late-day sun",
  },
  {
    slug: "seasonal-cleanup",
    name: "Spring & fall cleanup",
    short: "Leaves, debris and overgrowth cleared so the yard starts each season clean.",
    body: "Spring cleanup gets beds, borders and turf ready for growth. Fall cleanup blows and hauls the leaves that smother grass through winter.",
    includes: ["Leaf blowing and removal", "Bed and border cleanup", "Debris haul-off", "Cut-back of overgrowth"],
    cadence: "Spring and fall",
    image: "/images/stripes-curb.webp",
    imageAlt: "Clean front lawn with mowing stripes and a neatly mulched tree ring",
  },
  {
    slug: "flowerbeds-mulch",
    name: "Flowerbeds, mulch & pine needles",
    short: "Beds cleaned, trenched and topped with mulch or pine needles.",
    body: "Your flowerbeds can make or break the look of your lawn. We clear them out, cut a clean trenched edge, and finish with fresh mulch or pine needles so the line between bed and grass is sharp.",
    includes: ["Flowerbed cleaning", "Trenching (hand-cut edges)", "Mulching", "Pine needles"],
    cadence: "Once or twice a year",
    image: "/images/work/walk-after.webp",
    imageAlt: "Row of rounded shrubs in a freshly trenched bed of black mulch beside a brick walkway",
  },
  {
    slug: "planting",
    name: "Perennial, annual, shrub & tree planting",
    short: "Not your typical lawn service, more like a lawn beautician.",
    body: "Whether you want a bed refreshed once a year or planted in stages, we place and plant perennials, annuals, shrubs and trees to suit the light and the look of the house.",
    includes: ["Perennials", "Annuals", "Shrubs", "Trees"],
    cadence: "One-time or seasonal",
    image: "/images/planting-shrubs.webp",
    imageAlt: "New shrubs and ornamental grasses set out in a fresh bed along a front walk",
  },
  {
    slug: "aeration-overseeding",
    name: "Aeration, fertilization & overseeding",
    short: "Repairs thin, damaged turf so it grows back thick.",
    body: "Compacted, patchy lawns need more than a mow. Core aeration opens the soil, then fertilizer and seed go down so new grass fills in the bare spots.",
    includes: ["Core aeration", "Fertilization", "Overseeding"],
    cadence: "Usually once a year, in the fall",
    image: "/images/stripes-side.webp",
    imageAlt: "Lush striped side yard between two homes",
  },
  {
    slug: "retaining-walls",
    name: "Retaining walls & tree rings",
    short: "Stacked-block walls and raised rings that frame trees and beds.",
    body: "A low stacked-stone wall turns a bare tree base into a finished feature. We build raised rings and short retaining walls, then fill and mulch them.",
    includes: ["Raised tree rings", "Short retaining walls", "Fill and mulch"],
    cadence: "Project",
    image: "/images/wall-3.webp",
    imageAlt: "Curved stacked-stone retaining wall around a young tree, filled with mulch",
  },
  {
    slug: "pressure-washing",
    name: "Pressure washing",
    short: "Our service doesn't stop at the edge of your lawn.",
    body: "Driveways, walkways and patios washed clean so the hardscape matches the lawn next to it.",
    includes: ["Driveways", "Walkways", "Patios"],
    cadence: "As needed",
    image: "/images/pressure-wash.webp",
    imageAlt: "PBC crew member pressure washing a concrete driveway",
  },
];

export const workPairs = [
  {
    id: "walk",
    title: "Walkway bed: trenched and mulched",
    before: "/images/work/walk-before.webp",
    after: "/images/work/walk-after.webp",
    alt: "shrub bed along a brick walkway",
  },
  {
    id: "juniper",
    title: "Driveway juniper: cleaned and mulched",
    before: "/images/work/juniper-before.webp",
    after: "/images/work/juniper-after.webp",
    alt: "juniper bed beside a driveway",
  },
  {
    id: "corner",
    title: "Front corner: new edge line and mulch",
    before: "/images/work/corner-before.webp",
    after: "/images/work/corner-after.webp",
    alt: "front corner bed with a large evergreen",
  },
  {
    id: "front",
    title: "Front yard: brought back to green",
    before: "/images/work/front-before.webp",
    after: "/images/work/front-after.webp",
    alt: "front yard of a two-story home",
  },
] as const;

export const gallery = [
  { src: "/images/hero-house.webp", alt: "Ranch home with a freshly striped front lawn", w: 2099, h: 1250 },
  { src: "/images/stripes-truck.webp", alt: "PBC trailer and white pickup beside a diagonally striped lawn", w: 1200, h: 1600 },
  { src: "/images/bed-night.webp", alt: "Curved mulch bed with river-rock border and path lights at night", w: 1000, h: 1333 },
  { src: "/images/stripes-backyard.webp", alt: "Striped backyard behind a two-story home", w: 600, h: 800 },
  { src: "/images/wall-1.webp", alt: "Stacked-block tree ring beside an iron fence", w: 500, h: 500 },
  { src: "/images/pine-straw.webp", alt: "Striped lawn with pine-needle tree rings on a brick-ranch street", w: 360, h: 480 },
  { src: "/images/stripes-front.webp", alt: "Diagonal mowing stripes on a neighborhood front lawn", w: 320, h: 240 },
  { src: "/images/wall-2.webp", alt: "New stacked-stone tree ring freshly filled with soil", w: 500, h: 500 },
  { src: "/images/bed-trenched.webp", alt: "Bed cleared and trenched with a river-rock border before planting", w: 500, h: 667 },
  { src: "/images/bed-planting.webp", alt: "Shrubs and grasses set out in the bed before planting", w: 500, h: 667 },
  { src: "/images/stripes-curb.webp", alt: "Front lawn with stripes and a mulched tree ring", w: 600, h: 800 },
  { src: "/images/bed-edging.webp", alt: "Hand-cut bed edge around a boxwood mid-job", w: 600, h: 800 },
] as const;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Our work" },
  { href: "/about", label: "About" },
  { href: "/portal", label: "Customer login" },
] as const;

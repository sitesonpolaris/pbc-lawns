"use client";

import { useState } from "react";
import { workPairs } from "@/lib/site";
import { BeforeAfter } from "./BeforeAfter";

/** The page's live thing: pick a real PBC job and drag to compare. */
export function WorkCompare() {
  const [active, setActive] = useState(0);
  const pair = workPairs[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div className="lg:order-2">
        <BeforeAfter key={pair.id} before={pair.before} after={pair.after} alt={pair.alt} className="rounded-2xl" />
      </div>
      <div>
        <p className="text-lg text-ground/85">Drag the handle across the photo. Every picture here is a real PBC job.</p>
        <ul className="mt-8 space-y-2" role="list">
          {workPairs.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`w-full rounded-xl px-5 py-4 text-left text-lg font-semibold transition-colors ${
                  i === active ? "bg-gold text-ink" : "bg-ground/8 text-ground hover:bg-ground/15"
                }`}
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

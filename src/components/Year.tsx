import { cacheLife } from "next/cache";

// `new Date()` must live in a cached component under Cache Components.
export async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

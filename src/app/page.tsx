import HomeSections from "@/components/HomeSections";

/** Prerendered at build time — zero Worker CPU at request time. */
export const dynamic = "force-static";

export default function HomePage() {
  return <HomeSections page={1} />;
}

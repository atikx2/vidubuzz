import Link from "next/link";
import { Logo } from "./icons";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Browse",
    links: [
      { label: "Trending Videos", href: "/videos" },
      { label: "Categories", href: "/categories" },
      { label: "Pornstars", href: "/pornstars" },
      { label: "Channels", href: "/channels" },
      { label: "Tags", href: "/tags" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Advertise", href: "/advertise" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "DMCA / Takedown", href: "/dmca" },
      { label: "Content Removal", href: "/removal" },
      { label: "2257 Statement", href: "/2257" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-ink-900/55">
      <div className="mx-auto grid max-w-[1500px] gap-9 px-5 py-11 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-mute-400">
            Trending HD videos from verified channels and models, updated hourly and streamed in
            adaptive quality.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-white/80">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[12.5px] text-mute-400 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] px-5 py-5">
        <p className="mx-auto max-w-[1500px] text-[11.5px] text-mute-400">
          © {new Date().getFullYear()} vidubuzz. All models were 18 or older at the time of
          production. Access restricted to adults 18+.
        </p>
      </div>
    </footer>
  );
}

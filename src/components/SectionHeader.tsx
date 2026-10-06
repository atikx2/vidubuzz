import Link from "next/link";
import type { SectionConfig } from "@/data/site-sections";
import { ChevronRight } from "./icons";

/**
 * Section heading block.
 * `heading` renders as the <h2> — it is the SEO-visible text and is the
 * value the admin panel will edit.
 */
export default function SectionHeader({ section }: { section: SectionConfig }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-[19px] font-semibold tracking-tight text-white sm:text-[21px]">
          <span className="h-[18px] w-[3px] shrink-0 rounded-full bg-gradient-to-b from-brand-400 to-accent-500" />
          {section.heading}
        </h2>
        {section.subheading && (
          <p className="mt-1 truncate pl-[13px] text-[12.5px] text-mute-400">{section.subheading}</p>
        )}
      </div>

      {section.viewAllHref && (
        <Link
          href={section.viewAllHref}
          className="group flex shrink-0 items-center gap-1 rounded-full bg-white/[0.05] py-1.5 pl-3.5 pr-2.5 text-[12.5px] font-medium text-mute-300 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          {section.viewAllLabel ?? "View All"}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

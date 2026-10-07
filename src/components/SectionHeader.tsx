import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { SectionConfig } from "@/data/site-sections";
import { Button } from "./ui/button";

/**
 * Section heading block.
 * `heading` renders as the <h2> — it is the SEO-visible text and the value
 * the admin panel will edit.
 */
export default function SectionHeader({ section }: { section: SectionConfig }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-[19px] font-semibold tracking-tight text-foreground sm:text-[21px]">
          <span className="h-[18px] w-[3px] shrink-0 rounded-full bg-gradient-to-b from-brand-400 to-accent-500" />
          {section.heading}
        </h2>
        {section.subheading && (
          <p className="mt-1 truncate pl-[13px] text-[12.5px] text-muted-foreground">
            {section.subheading}
          </p>
        )}
      </div>

      {section.viewAllHref && (
        <Button asChild variant="secondary" size="sm" className="group rounded-full">
          <Link href={section.viewAllHref}>
            {section.viewAllLabel ?? "View All"}
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}

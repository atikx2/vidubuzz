import Link from "next/link";
import type { Channel, Pornstar } from "@/lib/types";
import { placeholderGradient } from "@/lib/format";
import { DefaultAvatar, VideoIcon } from "./icons";

interface Props {
  person: Pornstar | Channel;
  kind: "pornstar" | "channel";
}

export default function PersonCard({ person, kind }: Props) {
  const href = kind === "pornstar" ? `/pornstars/${person.slug}/` : `/channels/${person.slug}/`;

  return (
    <Link
      href={href}
      title={person.name}
      className="group flex flex-col overflow-hidden rounded-2xl bg-ink-850 ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(168,85,247,0.5)] hover:ring-brand-500/35"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {person.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.avatarUrl}
            alt={person.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="block h-full w-full transition-transform duration-500 group-hover:scale-105"
            style={{ background: placeholderGradient(person.slug) }}
          />
        )}

        {/* default icon sits on the placeholder so the card never looks empty */}
        {!person.avatarUrl && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <DefaultAvatar
              name={person.name}
              variant={kind === "channel" ? "channel" : "star"}
              className="h-14 w-14 text-[17px] shadow-xl"
            />
          </span>
        )}

        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <span className="absolute inset-x-0 bottom-0 p-2.5">
          <span className="block truncate text-[13px] font-semibold text-white">{person.name}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
            <VideoIcon className="h-3 w-3" />
            {person.videoCount.toLocaleString("en-US")} videos
          </span>
        </span>
      </div>
    </Link>
  );
}

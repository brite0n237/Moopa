import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export type ExternalLink = {
  site?: string | null;
  url?: string | null;
  type?: string | null;
  language?: string | null;
  color?: string | null;
  isDisabled?: boolean | null;
};

/**
 * Official places to watch, taken from AniList's STREAMING external links
 * (Crunchyroll, Netflix, YouTube channels, ...). Pure function so it can be
 * tested without rendering anything.
 */
export function getStreamingLinks(links?: ExternalLink[] | null) {
  if (!Array.isArray(links)) return [];

  const seen = new Set<string>();
  const result: { site: string; url: string; color: string | null }[] = [];

  for (const link of links) {
    if (!link || link.type !== "STREAMING" || link.isDisabled) continue;
    if (!link.site || !link.url) continue;

    // Only plain https links are shown.
    let parsed: URL;
    try {
      parsed = new URL(link.url);
    } catch {
      continue;
    }
    if (parsed.protocol !== "https:") continue;

    const key = `${link.site}|${link.language || ""}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      site: link.site,
      url: parsed.toString(),
      color: /^#[0-9a-f]{3,8}$/i.test(link.color || "") ? link.color! : null,
    });
  }

  return result;
}

export default function WatchOnLinks({
  links,
}: {
  links?: ExternalLink[] | null;
}) {
  const streaming = getStreamingLinks(links);

  return (
    <div className="flex flex-col gap-2 w-full md:items-start items-center px-3 md:px-0">
      <p className="font-karla font-semibold text-lg">Watch on</p>
      {streaming.length > 0 ? (
        <div className="flex flex-wrap gap-2 md:justify-start justify-center">
          {streaming.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-karla text-sm font-semibold hover:opacity-80"
              style={
                item.color
                  ? { borderLeft: `4px solid ${item.color}` }
                  : undefined
              }
            >
              {item.site}
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          ))}
        </div>
      ) : (
        <p className="font-karla text-sm text-white/60">
          No official streaming links were found for this anime yet.
        </p>
      )}
    </div>
  );
}

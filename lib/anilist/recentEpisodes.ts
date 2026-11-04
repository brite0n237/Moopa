// Recently aired anime episodes, taken from AniList's airing schedule.

const RECENT_QUERY = `
query ($page: Int, $perPage: Int, $now: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    airingSchedules(airingAt_lesser: $now, sort: TIME_DESC) {
      episode
      airingAt
      media {
        id
        type
        isAdult
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
        }
      }
    }
  }
}`;

export type RecentEpisode = {
  id: number;
  title: { romaji: string | null; english: string | null; native: string | null };
  currentEpisode: number;
  coverImage: string | null;
};

type Schedule = {
  episode?: number | null;
  airingAt?: number | null;
  media?: {
    id?: number;
    type?: string | null;
    isAdult?: boolean | null;
    title?: {
      romaji?: string | null;
      english?: string | null;
      native?: string | null;
    } | null;
    coverImage?: {
      extraLarge?: string | null;
      large?: string | null;
    } | null;
  } | null;
};

/**
 * Turns airing schedules (newest first) into one card per anime, keeping the
 * latest episode of each. Adult titles and entries with no cover are skipped.
 */
export function mapRecentEpisodes(schedules: Schedule[] | null | undefined) {
  const seen = new Set<number>();
  const results: RecentEpisode[] = [];

  for (const item of schedules ?? []) {
    const media = item?.media;
    if (!media?.id || media.type !== "ANIME" || media.isAdult) continue;
    if (!item.episode || seen.has(media.id)) continue;

    const cover = media.coverImage?.extraLarge || media.coverImage?.large;
    if (!cover) continue;

    seen.add(media.id);
    results.push({
      id: media.id,
      title: {
        romaji: media.title?.romaji ?? null,
        english: media.title?.english ?? null,
        native: media.title?.native ?? null,
      },
      currentEpisode: item.episode,
      coverImage: cover,
    });
  }

  return results;
}

export async function getRecentEpisodes(
  page = 1,
  perPage = 45,
  now = Math.floor(Date.now() / 1000)
) {
  const response = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: RECENT_QUERY,
      variables: { page, perPage, now },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList request failed (${response.status})`);
  }

  const json = await response.json();
  const pageData = json?.data?.Page;
  if (!pageData) {
    throw new Error("AniList returned no data");
  }

  return {
    results: mapRecentEpisodes(pageData.airingSchedules),
    hasNextPage: Boolean(pageData.pageInfo?.hasNextPage),
  };
}

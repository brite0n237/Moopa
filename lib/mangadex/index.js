// MangaDex API helpers (server-side only).
// Docs: https://api.mangadex.org/docs/
//
// Rules we follow (see https://api.mangadex.org/docs/2-limitations):
//  - ~5 requests/second per IP, /at-home/server is 40 requests/minute.
//    -> results are cached (Redis if available, otherwise in memory).
//  - Requests need an honest, non-spoofed User-Agent.
//  - No CORS for other sites and no hotlinking, so everything runs on the
//    server and images go through /api/manga/image.

import { redis } from "@/lib/redis";

const API = "https://api.mangadex.org";
const USER_AGENT = process.env.MANGADEX_USER_AGENT || "Kazani/1.0";
const PROVIDER_ID = "mangadex";
// "data" = original quality, "data-saver" = compressed (smaller, faster).
const QUALITY =
  process.env.MANGADEX_QUALITY === "data-saver" ? "data-saver" : "data";
// Adult-only content is left out on purpose.
const RATINGS = ["safe", "suggestive", "erotica"];

// ---------- tiny cache (Redis when configured, memory otherwise) ----------

const memory = new Map();

async function cacheGet(key) {
  try {
    if (redis) {
      const hit = await redis.get(key);
      return hit ? JSON.parse(hit) : null;
    }
  } catch (error) {
    console.error("MangaDex cache read failed:", error);
  }
  const hit = memory.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  memory.delete(key);
  return null;
}

async function cacheSet(key, value, seconds) {
  try {
    if (redis) {
      await redis.set(key, JSON.stringify(value), "EX", seconds);
      return;
    }
  } catch (error) {
    console.error("MangaDex cache write failed:", error);
  }
  if (memory.size > 500) memory.clear();
  memory.set(key, { value, expires: Date.now() + seconds * 1000 });
}

// ---------- low level request ----------

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(`${key}[]`, v));
    } else {
      search.append(key, value);
    }
  }
  return search.toString();
}

async function mdFetch(path, params) {
  const query = buildQuery(params);
  const res = await fetch(`${API}${path}${query ? `?${query}` : ""}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (res.status === 429) {
    const error = new Error("MangaDex rate limit reached, try again shortly.");
    error.status = 429;
    throw error;
  }
  if (!res.ok) {
    const error = new Error(`MangaDex request failed (${res.status}).`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// ---------- title matching ----------

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function titlesOf(manga) {
  const attrs = manga?.attributes || {};
  const all = [
    ...Object.values(attrs.title || {}),
    ...(attrs.altTitles || []).flatMap((t) => Object.values(t)),
  ];
  return all.map(normalize).filter(Boolean);
}

/**
 * Find the MangaDex id for an AniList manga.
 * 1) Prefer an exact AniList id match (MangaDex stores it in links.al).
 * 2) Otherwise accept an exact title match.
 */
export async function findMangadexId({ anilistId, titles = [] }) {
  const candidates = [...new Set(titles.filter(Boolean))];
  if (candidates.length === 0) return null;

  const cacheKey = `mangadex:id:${anilistId || candidates[0]}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  let titleMatch = null;

  for (const title of candidates.slice(0, 3)) {
    const { data = [] } = await mdFetch("/manga", {
      title,
      limit: 10,
      contentRating: RATINGS,
      "order[relevance]": "desc",
    });

    if (anilistId) {
      const byLink = data.find((m) => m.attributes?.links?.al === String(anilistId));
      if (byLink) {
        await cacheSet(cacheKey, byLink.id, 60 * 60 * 24);
        return byLink.id;
      }
    }

    if (!titleMatch) {
      const wanted = candidates.map(normalize);
      titleMatch = data.find((m) => titlesOf(m).some((t) => wanted.includes(t)));
    }
  }

  if (titleMatch) {
    await cacheSet(cacheKey, titleMatch.id, 60 * 60 * 24);
    return titleMatch.id;
  }
  return null;
}

/** AniList id for a MangaDex manga (from its links.al), or null. */
export async function getAnilistIdFromMangadex(mangadexId) {
  const cacheKey = `mangadex:al:${mangadexId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const { data } = await mdFetch(`/manga/${encodeURIComponent(mangadexId)}`);
  const id = data?.attributes?.links?.al || null;
  if (id) await cacheSet(cacheKey, id, 60 * 60 * 24);
  return id;
}

// ---------- chapters ----------

/**
 * English chapters for a manga, newest first, one entry per chapter number.
 * Shape matches what the UI already expects:
 *   [{ providerId: "mangadex", chapters: [{ id, number, title }] }]
 */
export async function getChapters(mangadexId) {
  const cacheKey = `mangadex:chapters:${mangadexId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const limit = 500;
  let offset = 0;
  let total = 0;
  const all = [];

  do {
    const page = await mdFetch(`/manga/${encodeURIComponent(mangadexId)}/feed`, {
      limit,
      offset,
      translatedLanguage: ["en"],
      contentRating: RATINGS,
      includeExternalUrl: 0,
      includeEmptyPages: 0,
      "order[chapter]": "desc",
    });
    all.push(...(page.data || []));
    total = page.total || 0;
    offset += limit;
  } while (offset < total && offset < 5000);

  // Several scanlation groups often upload the same chapter: keep the one
  // with the most pages.
  const byNumber = new Map();
  for (const item of all) {
    const attrs = item.attributes || {};
    if (!attrs.pages) continue;
    const number = attrs.chapter ?? "0";
    const existing = byNumber.get(number);
    if (!existing || attrs.pages > existing.pages) {
      byNumber.set(number, {
        id: item.id,
        number,
        title: attrs.title || `Chapter ${number}`,
        pages: attrs.pages,
      });
    }
  }

  const chapters = [...byNumber.values()]
    .sort((a, b) => parseFloat(b.number) - parseFloat(a.number))
    .map(({ id, number, title }) => ({ id, number, title }));

  const result = chapters.length
    ? [{ providerId: PROVIDER_ID, chapters }]
    : [];
  if (result.length) await cacheSet(cacheKey, result, 60 * 60);
  return result;
}

// ---------- pages ----------

/**
 * Page images for a chapter, as [{ index, url }].
 * The at-home base URL expires after ~15 minutes, so we only cache for 10.
 */
export async function getPages(chapterId) {
  const cacheKey = `mangadex:pages:${chapterId}:${QUALITY}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const data = await mdFetch(`/at-home/server/${encodeURIComponent(chapterId)}`);
  const files = QUALITY === "data-saver" ? data.chapter?.dataSaver : data.chapter?.data;

  if (!data.baseUrl || !data.chapter?.hash || !files?.length) {
    return { error: "This chapter has no readable pages." };
  }

  const pages = files.map((file, index) => ({
    index,
    url: `${data.baseUrl}/${QUALITY}/${data.chapter.hash}/${file}`,
  }));

  await cacheSet(cacheKey, pages, 60 * 10);
  return pages;
}

export { PROVIDER_ID, USER_AGENT };

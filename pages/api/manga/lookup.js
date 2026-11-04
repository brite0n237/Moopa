import {
  findMangadexId,
  getAnilistIdFromMangadex,
} from "@/lib/mangadex";

// GET /api/manga/lookup?anilist=<id>&romaji=..&english=..&native=..  ->  { id }
// GET /api/manga/lookup?mangadex=<uuid>                              ->  { anilist }
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { anilist, romaji, english, native, mangadex } = req.query;

  try {
    if (mangadex) {
      const id = await getAnilistIdFromMangadex(String(mangadex));
      return id
        ? res.status(200).json({ anilist: id })
        : res.status(404).json({ error: "No AniList link found" });
    }

    const id = await findMangadexId({
      anilistId: anilist ? String(anilist) : null,
      titles: [english, romaji, native].map((t) => (t ? String(t) : null)),
    });

    return id
      ? res.status(200).json({ id })
      : res.status(404).json({ error: "Manga not found on MangaDex" });
  } catch (error) {
    return res
      .status(error.status === 429 ? 429 : 502)
      .json({ error: error.message });
  }
}

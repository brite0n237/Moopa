import { getChapters } from "@/lib/mangadex";

// GET /api/manga/chapters/<mangadex id>
//   -> [{ providerId: "mangadex", chapters: [{ id, number, title }] }]
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chapters = await getChapters(String(req.query.id));
    if (!chapters.length) {
      return res.status(404).json({ error: "No English chapters available" });
    }
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    return res.status(200).json(chapters);
  } catch (error) {
    return res
      .status(error.status === 429 ? 429 : 502)
      .json({ error: error.message });
  }
}

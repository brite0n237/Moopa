import { rateLimitStrict, redis } from "@/lib/redis";
import { getRecentEpisodes } from "@/lib/anilist/recentEpisodes";
import { NextApiRequest, NextApiResponse } from "next";

// GET /api/v2/etc/recent/<page>  ->  { results: [...], hasNextPage }
// Recently aired episodes, from AniList's airing schedule.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (redis) {
      try {
        const ipAddress: any = req.socket.remoteAddress;
        await rateLimitStrict?.consume(ipAddress);
      } catch (error: any) {
        return res.status(429).json({
          error: `Too Many Requests, retry after ${error.msBeforeNext / 1000}`,
        });
      }
    }

    const page = Math.min(Math.max(parseInt(String(req.query.page), 10) || 1, 1), 20);
    const cacheKey = `recent-episode:${page}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    }

    const data = await getRecentEpisodes(page);

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(data), "EX", 60 * 10);
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Failed to load recent episodes:", error?.message);
    return res.status(502).json({ error: "Could not load recent episodes" });
  }
}

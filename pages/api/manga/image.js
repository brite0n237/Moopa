import { Readable } from "stream";
import { USER_AGENT } from "@/lib/mangadex";

// Image proxy for MangaDex pages. MangaDex answers hotlinked images with a
// wrong response and sends no CORS headers, so the browser loads images
// from here instead.
//
// GET /api/manga/image?url=<encoded image url>

export const config = { api: { responseLimit: false } };

function isAllowedHost(hostname) {
  return (
    hostname === "mangadex.org" ||
    hostname.endsWith(".mangadex.org") ||
    hostname.endsWith(".mangadex.network")
  );
}

// MangaDex asks for a report for every image served from a node that is not
// on mangadex.org (https://api.mangadex.org/docs/04-chapter/retrieving-chapter).
function report({ url, success, bytes, duration, cached }) {
  fetch("https://api.mangadex.network/report", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify({ url, success, bytes, duration, cached }),
  }).catch(() => {});
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let target;
  try {
    target = new URL(String(req.query.url || ""));
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }

  // Only https and only MangaDex hosts: this stops the route being used to
  // fetch arbitrary addresses.
  if (target.protocol !== "https:" || !isAllowedHost(target.hostname)) {
    return res.status(400).json({ error: "Host not allowed" });
  }

  const started = Date.now();
  const shouldReport = !target.hostname.endsWith(".mangadex.org") && target.hostname !== "mangadex.org";

  try {
    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!upstream.ok || !upstream.body) {
      if (shouldReport) {
        report({ url: target.toString(), success: false, bytes: 0, duration: Date.now() - started, cached: false });
      }
      return res.status(upstream.status === 404 ? 404 : 502).json({ error: "Image unavailable" });
    }

    const type = upstream.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) {
      return res.status(502).json({ error: "Unexpected response" });
    }

    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");
    const length = upstream.headers.get("content-length");
    if (length) res.setHeader("Content-Length", length);

    if (shouldReport) {
      report({
        url: target.toString(),
        success: true,
        bytes: Number(length) || 0,
        duration: Date.now() - started,
        cached: (upstream.headers.get("x-cache") || "").startsWith("HIT"),
      });
    }

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    if (shouldReport) {
      report({ url: target.toString(), success: false, bytes: 0, duration: Date.now() - started, cached: false });
    }
    if (!res.headersSent) {
      return res.status(502).json({ error: "Image fetch failed" });
    }
    res.end();
  }
}

import { NextResponse } from "next/server";

// Keeps the Last.fm API key on the server (set LASTFM_API_KEY in Vercel env vars).
const API_KEY = process.env.LASTFM_API_KEY || "f8423408e5019132bc7e3b7d4d8fbb60";
const USERNAME = process.env.LASTFM_USERNAME || "ckbdidit";

interface LastFmImage {
  size: string;
  "#text": string;
}

export async function GET() {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return NextResponse.json({ track: null });
    }

    const data = await res.json();
    const latest = data?.recenttracks?.track?.[0];

    if (!latest) {
      return NextResponse.json({ track: null });
    }

    const images: LastFmImage[] = latest.image || [];
    const albumArt =
      images.find((img) => img.size === "extralarge")?.["#text"] ||
      images.find((img) => img.size === "large")?.["#text"] ||
      images[0]?.["#text"] ||
      "";

    return NextResponse.json(
      {
        track: {
          name: latest.name,
          artist: latest.artist?.["#text"] || "",
          album: latest.album?.["#text"] || "",
          albumArt,
          url: latest.url || "",
          nowPlaying: latest["@attr"]?.nowplaying === "true",
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ track: null });
  }
}

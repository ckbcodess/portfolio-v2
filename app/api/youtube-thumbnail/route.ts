import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get("track");
  const artist = searchParams.get("artist");

  if (!track) {
    return NextResponse.json({ error: "Missing track name" }, { status: 400 });
  }

  const query = artist ? `${track} ${artist}` : track;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

    if (match && match[1]) {
      const videoId = match[1];
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      return NextResponse.json({ thumbnailUrl });
    }

    return NextResponse.json({ error: "No video found" }, { status: 404 });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

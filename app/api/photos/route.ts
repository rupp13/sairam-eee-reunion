import { NextResponse } from "next/server";
import { getAlbumPhotos, type Album } from "@/lib/icloud-album";

const ALBUM_TOKEN = "090SDXlcrJz11ZZBh6VYIszLg";
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: Album; fetchedAt: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  }

  try {
    const data = await getAlbumPhotos(ALBUM_TOKEN);
    cache = { data, fetchedAt: Date.now() };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error(err);
    if (cache) {
      // Serve stale data rather than nothing if iCloud is temporarily down.
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      {
        error: "Could not load photos from the shared album.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}

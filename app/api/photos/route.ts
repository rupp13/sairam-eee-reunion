import { NextResponse } from "next/server";
import { getAlbumPhotos, type Album } from "@/lib/icloud-album";

const ALBUM_TOKEN = "090SDXlcrJz11ZZBh6VYIszLg";
const CACHE_TTL_MS = 5 * 60 * 1000;

function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const parts = [err.message];
  let cause = err.cause;
  while (cause) {
    if (cause instanceof Error) {
      const code = "code" in cause ? ` (${(cause as { code: unknown }).code})` : "";
      parts.push(`${cause.message}${code}`);
      cause = cause.cause;
    } else {
      parts.push(String(cause));
      break;
    }
  }
  return parts.join(" <- caused by: ");
}

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
        detail: describeError(err),
      },
      { status: 502 }
    );
  }
}

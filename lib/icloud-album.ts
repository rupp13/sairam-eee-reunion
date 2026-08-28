const BASE_62_CHAR_SET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function base62ToInt(chars: string) {
  let value = 0;
  for (const char of chars) {
    value = value * 62 + BASE_62_CHAR_SET.indexOf(char);
  }
  return value;
}

// Ported from the icloud-shared-album npm package's token decoding: the
// token encodes a guessed server partition. Apple corrects it with a 330
// redirect if the guess is wrong, so this only needs to be a starting point.
function getBaseUrl(token: string) {
  const partition =
    token[0] === "A" ? base62ToInt(token[1]) : base62ToInt(token.slice(1, 3));
  const partitionStr = partition < 10 ? `0${partition}` : String(partition);
  return `https://p${partitionStr}-sharedstreams.icloud.com/${token}/sharedstreams/`;
}

const REQUEST_HEADERS = {
  Origin: "https://www.icloud.com",
  "Accept-Language": "en-US,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Content-Type": "text/plain",
  Accept: "*/*",
  Referer: "https://www.icloud.com/sharedalbum/",
};

async function describeFailure(res: Response, step: string) {
  const bodySnippet = (await res.text()).slice(0, 300);
  return `${step} failed: HTTP ${res.status} ${res.statusText} — ${bodySnippet || "(empty body)"}`;
}

async function getRedirectedBaseUrl(baseUrl: string, token: string) {
  const res = await fetch(`${baseUrl}webstream`, {
    method: "POST",
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ streamCtag: null }),
  });

  // Apple issues a non-standard 330 status pointing at the correct
  // per-partition host; fetch() won't follow it automatically.
  if (res.status === 330) {
    const raw = await res.text();
    let body: { "X-Apple-MMe-Host"?: string };
    try {
      body = JSON.parse(raw);
    } catch {
      throw new Error(
        `redirect step: 330 response body wasn't JSON — ${raw.slice(0, 300)}`
      );
    }
    if (!body["X-Apple-MMe-Host"]) {
      throw new Error(
        `redirect step: 330 response missing X-Apple-MMe-Host — ${raw.slice(0, 300)}`
      );
    }
    return `https://${body["X-Apple-MMe-Host"]}/${token}/sharedstreams/`;
  }

  if (!res.ok) {
    throw new Error(await describeFailure(res, "redirect step"));
  }

  return baseUrl;
}

type RawDerivative = {
  checksum: string;
  fileSize: string;
  width: string;
  height: string;
};

type RawPhoto = {
  photoGuid: string;
  dateCreated: string;
  batchDateCreated: string;
  width: string;
  height: string;
  caption?: string;
  derivatives: Record<string, RawDerivative>;
};

type WebstreamResponse = {
  photos: RawPhoto[];
  streamName: string;
};

async function getWebstream(baseUrl: string): Promise<WebstreamResponse> {
  const res = await fetch(`${baseUrl}webstream`, {
    method: "POST",
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ streamCtag: null }),
  });
  if (!res.ok) {
    throw new Error(await describeFailure(res, "webstream step"));
  }
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `webstream step: response wasn't JSON — ${raw.slice(0, 300)}`
    );
  }
}

async function getAssetUrls(baseUrl: string, photoGuids: string[]) {
  const res = await fetch(`${baseUrl}webasseturls`, {
    method: "POST",
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ photoGuids }),
  });
  if (!res.ok) {
    throw new Error(await describeFailure(res, "webasseturls step"));
  }
  const raw = await res.text();
  let data: { items: Record<string, { url_location: string; url_path: string }> };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      `webasseturls step: response wasn't JSON — ${raw.slice(0, 300)}`
    );
  }
  const urls: Record<string, string> = {};
  for (const [checksum, item] of Object.entries(data.items)) {
    urls[checksum] = `https://${item.url_location}${item.url_path}`;
  }
  return urls;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export type AlbumPhoto = {
  guid: string;
  width: number;
  height: number;
  dateCreated: string;
  caption: string;
  thumbUrl: string;
  fullUrl: string;
};

export type Album = {
  streamName: string;
  photos: AlbumPhoto[];
};

export async function getAlbumPhotos(token: string): Promise<Album> {
  const guessedBaseUrl = getBaseUrl(token);
  const baseUrl = await getRedirectedBaseUrl(guessedBaseUrl, token);
  const stream = await getWebstream(baseUrl);

  const photoGuids = stream.photos.map((p) => p.photoGuid);
  const checksumToUrl: Record<string, string> = {};
  for (const guidChunk of chunk(photoGuids, 25)) {
    Object.assign(checksumToUrl, await getAssetUrls(baseUrl, guidChunk));
  }

  const photos: AlbumPhoto[] = [];
  for (const photo of stream.photos) {
    const derivatives = Object.values(photo.derivatives)
      .filter((d) => checksumToUrl[d.checksum])
      .map((d) => ({
        url: checksumToUrl[d.checksum],
        width: Number(d.width),
        height: Number(d.height),
      }))
      .sort((a, b) => a.height - b.height);

    if (derivatives.length === 0) continue;

    photos.push({
      guid: photo.photoGuid,
      width: Number(photo.width),
      height: Number(photo.height),
      dateCreated: photo.dateCreated,
      caption: photo.caption ?? "",
      thumbUrl: derivatives[0].url,
      fullUrl: derivatives[derivatives.length - 1].url,
    });
  }

  photos.sort(
    (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );

  return { streamName: stream.streamName, photos };
}

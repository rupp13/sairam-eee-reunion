// iOS 27 shared-album links (photos.icloud.com/shared/album/<token>) are backed
// by CloudKit's public database web service, not the legacy sharedstreams API
// used by the old icloud.com/sharedalbum/#<token> links. Protocol reverse
// engineered from a HAR capture of the public web viewer:
//   1. POST .../public/records/resolve  -- turns the share token into a zoneID
//      plus a short-lived anonymousPublicAccess token and the per-share
//      database partition host to use for everything else.
//   2. POST {partition}/.../shared/records/query -- fetches CPLMaster +
//      CPLAsset records for the zone. Paginated manually via startRank (an
//      item index) since this record type returns no continuation cursor;
//      total item count comes from a separate HyperionIndexCountLookup query.
//   3. Each CPLMaster record's derivative fields (resJPEGThumbRes, etc.)
//      carry a pre-signed, unauthenticated download URL good for ~15-20 min.

const CLIENT_BUILD_NUMBER = "2630BuildBeta18";

const REQUEST_HEADERS = {
  "Content-Type": "text/plain",
  Accept: "*/*",
  Origin: "https://photos.icloud.com",
  Referer: "https://photos.icloud.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
};

async function describeFailure(res: Response, step: string) {
  const bodySnippet = (await res.text()).slice(0, 300);
  return `${step} failed: HTTP ${res.status} ${res.statusText} — ${bodySnippet || "(empty body)"}`;
}

async function postJson(url: string, body: unknown, step: string): Promise<Response> {
  try {
    return await fetch(url, {
      method: "POST",
      headers: REQUEST_HEADERS,
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`${step}: network request to ${url} failed`, { cause: err });
  }
}

async function postJsonAndParse<T>(url: string, body: unknown, step: string): Promise<T> {
  const res = await postJson(url, body, step);
  if (!res.ok) {
    throw new Error(await describeFailure(res, step));
  }
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${step}: response wasn't JSON — ${raw.slice(0, 300)}`);
  }
}

type ZoneID = {
  zoneName: string;
  ownerRecordName: string;
  zoneType: string;
};

type ResolveResponse = {
  results?: Array<{
    zoneID?: ZoneID;
    anonymousPublicAccess?: {
      token: string;
      databasePartition: string;
    };
    share?: {
      fields?: {
        "cloudkit.title"?: { value?: string };
      };
    };
  }>;
};

async function resolveShare(token: string) {
  const url =
    `https://ckdatabasews.icloud.com/database/1/com.apple.photos.cloud/production/public/records/resolve` +
    `?remapEnums=true&getCurrentSyncToken=true&clientBuildNumber=${CLIENT_BUILD_NUMBER}` +
    `&clientMasteringNumber=${CLIENT_BUILD_NUMBER}&sharing_url_key=${token}`;

  const data = await postJsonAndParse<ResolveResponse>(
    url,
    { shortGUIDs: [{ value: token }] },
    "resolve step"
  );

  const result = data.results?.[0];
  const access = result?.anonymousPublicAccess;
  if (!result?.zoneID || !access?.token || !access?.databasePartition) {
    throw new Error(
      `resolve step: response missing zoneID/anonymousPublicAccess — ${JSON.stringify(data).slice(0, 300)}`
    );
  }

  return {
    zoneID: result.zoneID,
    authToken: access.token,
    partitionUrl: access.databasePartition,
    title: result.share?.fields?.["cloudkit.title"]?.value ?? "",
  };
}

type RawFieldValue = { value?: unknown; type?: string };

type RawAssetRef = {
  downloadURL: string;
};

type RawRecord = {
  recordName: string;
  recordType: string;
  fields: Record<string, RawFieldValue>;
};

type QueryResponse = {
  records?: RawRecord[];
};

type CountResponse = {
  records?: Array<{ fields?: Record<string, RawFieldValue> }>;
};

// Items per request while paging through the album. Chosen to match sizes
// seen from the real web viewer (it never asks for more than 50 records —
// i.e. 25 items — at once); asking for everything in one large request
// silently gets capped short by the server with no error and no signal
// that more data exists.
const PAGE_SIZE_ITEMS = 25;

async function getItemCount(
  queryUrl: string,
  zoneID: ZoneID
): Promise<number> {
  const data = await postJsonAndParse<CountResponse>(
    queryUrl,
    {
      query: {
        recordType: "HyperionIndexCountLookup",
        filterBy: [
          {
            fieldName: "indexCountID",
            comparator: "IN",
            fieldValue: { value: ["CPLAssetByAddedDate"], type: "STRING_LIST" },
          },
        ],
      },
      zoneID,
    },
    "count step"
  );

  const count = data.records?.[0]?.fields?.itemCount?.value;
  if (typeof count !== "number") {
    throw new Error(`count step: response missing itemCount — ${JSON.stringify(data).slice(0, 300)}`);
  }
  return count;
}

async function queryAllAssetRecords(
  partitionUrl: string,
  authToken: string,
  zoneID: ZoneID,
  token: string
) {
  const clientId =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const params = new URLSearchParams({
    remapEnums: "true",
    getCurrentSyncToken: "true",
    sharing_url_key: token,
    publicAccessAuthToken: authToken,
    clientBuildNumber: CLIENT_BUILD_NUMBER,
    clientMasteringNumber: CLIENT_BUILD_NUMBER,
    clientId,
  });
  const url = `${partitionUrl}/database/1/com.apple.photos.cloud/production/shared/records/query?${params}`;

  const itemCount = await getItemCount(url, zoneID);

  // The API doesn't return a continuation cursor for this record type —
  // pagination is manual, walking startRank (an item index) in fixed-size
  // steps until every item has been requested. Fired concurrently rather
  // than awaited one at a time: sequential round-trips to Apple for a
  // larger album can add up past Vercel's function time limit.
  const startRanks: number[] = [];
  for (let startRank = 0; startRank < itemCount; startRank += PAGE_SIZE_ITEMS) {
    startRanks.push(startRank);
  }

  const pages = await Promise.all(
    startRanks.map(async (startRank) => {
      const body = {
        query: {
          recordType: "CPLAssetAndMasterByAddedDate",
          filterBy: [
            {
              fieldName: "direction",
              comparator: "EQUALS",
              fieldValue: { value: "ASCENDING", type: "STRING" },
            },
            {
              fieldName: "startRank",
              comparator: "EQUALS",
              fieldValue: { value: startRank, type: "INT64" },
            },
          ],
        },
        zoneID,
        resultsLimit: PAGE_SIZE_ITEMS * 2,
      };
      const data = await postJsonAndParse<QueryResponse>(url, body, "query step");
      const got = data.records ?? [];
      console.log(`[icloud-album] page startRank=${startRank} resultsLimit=${PAGE_SIZE_ITEMS * 2} -> ${got.length} records`);
      return got;
    })
  );

  const records = pages.flat();
  console.log(`[icloud-album] itemCount=${itemCount} totalRecordsFetched=${records.length}`);

  return records;
}

function fieldValue(fields: Record<string, RawFieldValue>, key: string): unknown {
  return fields[key]?.value;
}

function buildAssetUrl(res: unknown, fileType: unknown): string | null {
  if (
    !res ||
    typeof res !== "object" ||
    typeof (res as RawAssetRef).downloadURL !== "string" ||
    typeof fileType !== "string"
  ) {
    return null;
  }
  return (res as RawAssetRef).downloadURL.replace("${f}", encodeURIComponent(fileType));
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
  const { zoneID, authToken, partitionUrl, title } = await resolveShare(token);
  const records = await queryAllAssetRecords(partitionUrl, authToken, zoneID, token);

  const masters = new Map<string, RawRecord>();
  const assets: RawRecord[] = [];
  let duplicateMasterOverwrites = 0;
  for (const record of records) {
    if (record.recordType === "CPLMaster") {
      const existing = masters.get(record.recordName);
      if (existing) {
        duplicateMasterOverwrites++;
        const existingFieldCount = Object.keys(existing.fields).length;
        const newFieldCount = Object.keys(record.fields).length;
        if (existingFieldCount !== newFieldCount) {
          console.log(
            `[icloud-album] duplicate master ${record.recordName}: existing had ${existingFieldCount} fields, new has ${newFieldCount} fields`
          );
        }
      }
      masters.set(record.recordName, record);
    } else if (record.recordType === "CPLAsset") assets.push(record);
  }
  if (duplicateMasterOverwrites > 0) {
    console.log(`[icloud-album] duplicateMasterOverwrites: ${duplicateMasterOverwrites}`);
  }

  let skippedNoMaster = 0;
  let skippedNoDerivative = 0;
  let loggedMissingDerivativeSample = 0;
  const itemTypeCounts: Record<string, number> = {};

  const photos: AlbumPhoto[] = [];
  for (const asset of assets) {
    const masterRefValue = fieldValue(asset.fields, "masterRef") as
      | { recordName?: string }
      | undefined;
    const master = masterRefValue?.recordName
      ? masters.get(masterRefValue.recordName)
      : undefined;
    if (!master) {
      skippedNoMaster++;
      continue;
    }

    const itemType = String(fieldValue(master.fields, "itemType") ?? "unknown");
    itemTypeCounts[itemType] = (itemTypeCounts[itemType] ?? 0) + 1;

    const thumbUrl = buildAssetUrl(
      fieldValue(master.fields, "resJPEGThumbRes"),
      fieldValue(master.fields, "resJPEGThumbFileType")
    );
    const fullUrl =
      buildAssetUrl(
        fieldValue(master.fields, "resJPEGLargeRes"),
        fieldValue(master.fields, "resJPEGLargeFileType")
      ) ??
      buildAssetUrl(
        fieldValue(master.fields, "resJPEGMedRes"),
        fieldValue(master.fields, "resJPEGMedFileType")
      );

    // Skip non-photo masters (e.g. video-only records) for now — view/download
    // of photos is the current scope.
    if (!thumbUrl || !fullUrl) {
      skippedNoDerivative++;
      if (loggedMissingDerivativeSample < 5) {
        loggedMissingDerivativeSample++;
        console.log(
          `[icloud-album] missing derivative: itemType=${itemType} master=${master.recordName} fields=${JSON.stringify(Object.keys(master.fields))}`
        );
      }
      continue;
    }

    const dateMs = Number(
      fieldValue(asset.fields, "assetDate") ??
        fieldValue(asset.fields, "addedDate") ??
        Date.now()
    );

    photos.push({
      guid: asset.recordName,
      width: Number(
        fieldValue(master.fields, "resJPEGLargeWidth") ??
          fieldValue(master.fields, "resJPEGMedWidth") ??
          0
      ),
      height: Number(
        fieldValue(master.fields, "resJPEGLargeHeight") ??
          fieldValue(master.fields, "resJPEGMedHeight") ??
          0
      ),
      dateCreated: new Date(dateMs).toISOString(),
      caption: "",
      thumbUrl,
      fullUrl,
    });
  }

  photos.sort(
    (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );

  console.log(
    "[icloud-album] records:",
    records.length,
    "masters:",
    masters.size,
    "assets:",
    assets.length,
    "skippedNoMaster:",
    skippedNoMaster,
    "skippedNoDerivative:",
    skippedNoDerivative,
    "photos:",
    photos.length,
    "itemTypeCounts:",
    JSON.stringify(itemTypeCounts)
  );

  return { streamName: title || "Shared Album", photos };
}

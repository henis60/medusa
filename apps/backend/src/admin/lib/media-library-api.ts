import { sdk } from "./client";

export type MediaAsset = {
  key: string;
  url: string;
  size: number;
  last_modified: string | null;
  alt_text: string | null;
  tags: string[] | null;
  hidden: boolean;
};

// R2 keys contain slashes, so they can't be a plain route param — encode as
// base64url on the way out, matching the backend's decodeKey().
export function encodeKey(key: string): string {
  return btoa(key).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function fetchMediaAssets(params: {
  cursor?: string;
  limit?: number;
  q?: string;
  prefix?: string;
}): Promise<{ assets: MediaAsset[]; folders: string[]; nextCursor: string | null }> {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  if (params.prefix) search.set("prefix", params.prefix);
  return sdk.client.fetch<{
    assets: MediaAsset[];
    folders: string[];
    nextCursor: string | null;
  }>(`/admin/media-library?${search.toString()}`);
}


export async function updateMediaAssetMetadata(
  key: string,
  patch: { alt_text?: string | null; tags?: string[] | null },
): Promise<{ asset: any }> {
  return sdk.client.fetch(`/admin/media-library/${encodeKey(key)}`, {
    method: "POST",
    body: patch,
  });
}

export async function deleteMediaAsset(
  key: string,
  permanent: boolean,
): Promise<void> {
  await sdk.client.fetch(
    `/admin/media-library/${encodeKey(key)}?permanent=${permanent}`,
    { method: "DELETE" },
  );
}

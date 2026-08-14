import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3"

export type R2Object = {
  key: string
  url: string
  size: number
  last_modified: string | null
}

let client: S3Client | null = null

function getClient(): S3Client {
  if (client) return client
  client = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })
  return client
}

function toPublicUrl(key: string): string {
  const base = (process.env.S3_FILE_URL ?? "").replace(/\/$/, "")
  return `${base}/${key}`
}

function toObject(obj: _Object): R2Object {
  return {
    key: obj.Key ?? "",
    url: toPublicUrl(obj.Key ?? ""),
    size: obj.Size ?? 0,
    last_modified: obj.LastModified ? obj.LastModified.toISOString() : null,
  }
}

// Folder-aware listing: passing `Delimiter: "/"` makes S3/R2 group anything
// past the next "/" under `CommonPrefixes` instead of returning it as a file,
// so a `prefix` of "" lists top-level folders + root files, "coats/" lists
// only what's directly inside "coats/", etc. Without a delimiter this would
// recurse through the whole bucket instead of one folder level at a time.
export async function listR2Objects(opts: {
  cursor?: string
  limit?: number
  prefix?: string
  flat?: boolean
}): Promise<{
  objects: R2Object[]
  folders: string[]
  nextCursor: string | null
}> {
  const res = await getClient().send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      MaxKeys: opts.limit ?? 50,
      ContinuationToken: opts.cursor,
      Prefix: opts.prefix,
      Delimiter: opts.flat ? undefined : "/",
    })
  )

  const objects = (res.Contents ?? [])
    .filter((o) => (o.Size ?? 0) > 0)
    .map(toObject)

  const folders = (res.CommonPrefixes ?? [])
    .map((p) => p.Prefix ?? "")
    .filter(Boolean)

  return {
    objects,
    folders,
    nextCursor: res.IsTruncated ? (res.NextContinuationToken ?? null) : null,
  }
}

export async function deleteR2Object(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    })
  )
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await getClient().send(
      new HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
    )
    return true
  } catch (err: any) {
    // R2/S3 answer a HEAD on a missing key with 404 (NotFound / NoSuchKey).
    // Anything else (403, network) must not be read as "free to overwrite".
    const status = err?.$metadata?.httpStatusCode
    if (status === 404 || err?.name === "NotFound" || err?.name === "NoSuchKey") {
      return false
    }
    throw err
  }
}

// Because keys keep the original filename (no ulid — see uploadR2Object below),
// re-uploading the same name would silently replace an asset that is already
// live on the storefront and served with a 1-year immutable cache. Suffix
// "-1", "-2", … before the extension until the key is free instead.
//
// Best-effort against a concurrent upload of the same name (HEAD-then-PUT is
// not atomic, and R2 has no If-None-Match on PutObject), but it removes the
// deterministic overwrite, which is the case that actually happens.
async function resolveAvailableKey(key: string): Promise<string> {
  if (!(await objectExists(key))) return key

  const dot = key.lastIndexOf(".")
  const slash = key.lastIndexOf("/")
  const hasExt = dot > slash + 1
  const base = hasExt ? key.slice(0, dot) : key
  const ext = hasExt ? key.slice(dot) : ""

  for (let i = 1; i <= 100; i++) {
    const candidate = `${base}-${i}${ext}`
    if (!(await objectExists(candidate))) return candidate
  }

  // 100 collisions on one name means something is wrong upstream; a
  // timestamped key is still better than clobbering the original.
  return `${base}-${Date.now()}${ext}`
}

// Uploads directly (unlike the core uploadFilesWorkflow, which strips any
// directory from the filename via path.parse and always mangles the name
// with a ulid) so a chosen folder prefix is actually preserved in the key.
// The returned key may differ from the requested one when the name was already
// taken — callers must use `result.key`/`result.url`, not what they passed in.
export async function uploadR2Object(opts: {
  key: string
  content: Buffer
  mimeType: string
}): Promise<R2Object> {
  const key = await resolveAvailableKey(opts.key)

  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: opts.content,
      ContentType: opts.mimeType,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000",
    })
  )
  return {
    key,
    url: toPublicUrl(key),
    size: opts.content.byteLength,
    last_modified: new Date().toISOString(),
  }
}

// S3/R2 has no rename — a "rename" is a copy to the new key followed by a
// delete of the old one. Not atomic: if the delete step fails the object
// exists at both keys momentarily, which the workflow step below handles by
// retrying delete-only on compensation rather than re-copying.
export async function renameR2Object(opts: {
  oldKey: string
  newKey: string
}): Promise<R2Object> {
  // Same non-destructive rule as upload: renaming onto an existing name must
  // not silently replace that object. A no-op rename (same key) is left alone,
  // otherwise it would suffix the file against itself.
  const newKey =
    opts.newKey === opts.oldKey
      ? opts.newKey
      : await resolveAvailableKey(opts.newKey)

  await getClient().send(
    new CopyObjectCommand({
      Bucket: process.env.S3_BUCKET,
      CopySource: `${process.env.S3_BUCKET}/${encodeURIComponent(opts.oldKey)}`,
      Key: newKey,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000",
    })
  )
  if (newKey !== opts.oldKey) {
    await deleteR2Object(opts.oldKey)
  }
  return {
    key: newKey,
    url: toPublicUrl(newKey),
    size: 0,
    last_modified: new Date().toISOString(),
  }
}

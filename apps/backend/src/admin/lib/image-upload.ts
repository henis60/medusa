// Shared client-side image processing/upload helpers, used by both the AI
// product generator and the media library admin pages.

export async function processImage(file: File): Promise<File> {
  const MAX_WIDTH = 1600;
  const QUALITY = 0.85;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("toBlob failed"));
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: "image/webp",
            }),
          );
        },
        "image/webp",
        QUALITY,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadFiles(
  files: File[],
  convert: boolean,
  endpoint = "/admin/uploads",
  extraFields?: Record<string, string>,
): Promise<string[]> {
  if (!files.length) return [];
  const processed = convert
    ? await Promise.all(files.map(processImage))
    : files;
  const formData = new FormData();
  processed.forEach((f) => formData.append("files", f));
  if (extraFields) {
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));
  }
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }
  const data = await res.json();
  return data.files.map((f: any) => f.url);
}

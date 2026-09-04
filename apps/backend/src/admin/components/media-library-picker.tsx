import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Checkbox,
  Heading,
  IconButton,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui";
import { Check, Folder, XMark } from "@medusajs/icons";
import { uploadFiles } from "../lib/image-upload";
import { fetchMediaAssets } from "../lib/media-library-api";

export default function MediaLibraryPicker({
  onSelect,
  onClose,
}: {
  onSelect: (urls: string[]) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [prefix, setPrefix] = useState("");
  const [uploading, setUploading] = useState(false);
  const [convert, setConvert] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [lastUploadedUrls, setLastUploadedUrls] = useState<Set<string>>(
    new Set(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media-library-picker", q, prefix],
    queryFn: () => fetchMediaAssets({ limit: 60, q: q || undefined, prefix }),
  });

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(files, convert, "/admin/media-library", {
        folder: prefix.replace(/\/$/, ""),
      });
      setLastUploadedUrls(new Set(urls));
      await queryClient.invalidateQueries({ queryKey: ["media-library-picker"] });
      toast.success(`${files.length} imagini încărcate`);
    } catch (err: any) {
      toast.error(err.message || "Upload eșuat");
    } finally {
      setUploading(false);
    }
  };

  // A directory picker (webkitdirectory) hands back every file in the
  // selected tree in one flat FileList, each carrying its original path in
  // `webkitRelativePath` (e.g. "MyFolder/Sub/img.jpg"). The upload endpoint
  // only takes a single `folder` per request, so files are grouped by their
  // subfolder here and uploaded one request per subfolder — that's what
  // actually recreates the nested structure under the current library
  // folder, instead of dumping every file flat into one place.
  const handleFolderUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const groups = new Map<string, File[]>();
      for (const file of files) {
        const relPath = (file as any).webkitRelativePath || file.name;
        // Drop the filename, keep the subfolder path (may be empty for a
        // file directly in the picked root).
        const subfolder = relPath.split("/").slice(0, -1).join("/");
        const list = groups.get(subfolder) ?? [];
        list.push(file);
        groups.set(subfolder, list);
      }

      const allUrls: string[] = [];
      for (const [subfolder, groupFiles] of groups) {
        const folder = [prefix.replace(/\/$/, ""), subfolder]
          .filter(Boolean)
          .join("/");
        const urls = await uploadFiles(
          groupFiles,
          convert,
          "/admin/media-library",
          { folder },
        );
        allUrls.push(...urls);
      }

      setLastUploadedUrls(new Set(allUrls));
      await queryClient.invalidateQueries({ queryKey: ["media-library-picker"] });
      toast.success(
        `${files.length} imagini încărcate în ${groups.size} folder${groups.size === 1 ? "" : "e"}`,
      );
    } catch (err: any) {
      toast.error(err.message || "Upload eșuat");
    } finally {
      setUploading(false);
    }
  };

  const enterFolder = (folder: string) => {
    setPrefix(folder);
    setQ("");
  };

  // Folders are created implicitly by uploading into them — this just
  // navigates into a not-yet-existing path so the next upload lands there.
  const createFolder = () => {
    const name = newFolderName.trim().replace(/[/\\]+/g, "-");
    if (!name) return;
    enterFolder(`${prefix}${name}/`);
    setNewFolderName("");
  };

  const breadcrumbs = prefix
    ? prefix
        .split("/")
        .filter(Boolean)
        .map((segment, i, arr) => ({
          label: segment,
          path: arr.slice(0, i + 1).join("/") + "/",
        }))
    : [];

  const toggleSelection = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  const selectAssets = () => {
    if (selectedUrls.length === 0) return;
    onSelect(selectedUrls);
    setSelectedUrls([]);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-ui-bg-base rounded-lg shadow-elevation-modal w-[90vw] max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border-base">
          <Heading level="h2">Alege din bibliotecă</Heading>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id="picker-convert"
                checked={convert}
                onCheckedChange={(v) => setConvert(!!v)}
              />
              <Label htmlFor="picker-convert" className="text-xs">
                Conversie webp
              </Label>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) handleUpload(files);
                e.target.value = "";
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              // Non-standard but universally supported attributes for
              // picking a whole directory tree instead of individual files —
              // not in React's JSX typing for <input>, hence the spread.
              {...({ webkitdirectory: "", directory: "" } as any)}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) handleFolderUpload(files);
                e.target.value = "";
              }}
            />
            <Button
              size="small"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploading}
            >
              Încarcă imagini
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => folderInputRef.current?.click()}
              isLoading={uploading}
            >
              Încarcă folder
            </Button>
            <IconButton variant="transparent" onClick={onClose}>
              <XMark />
            </IconButton>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-ui-border-base flex flex-col gap-2">
          <Input
            placeholder="Caută după nume fișier..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {!q && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 text-sm flex-wrap">
                <button
                  className="text-ui-fg-interactive hover:underline"
                  onClick={() => enterFolder("")}
                >
                  Root
                </button>
                {breadcrumbs.map((b) => (
                  <span key={b.path} className="flex items-center gap-1">
                    <Text size="small" className="text-ui-fg-muted">
                      /
                    </Text>
                    <button
                      className="text-ui-fg-interactive hover:underline"
                      onClick={() => enterFolder(b.path)}
                    >
                      {b.label}
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  size="small"
                  placeholder="Folder nou..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                  className="w-40"
                />
                <Button size="small" variant="secondary" onClick={createFolder}>
                  Creează folder
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && <Text className="text-ui-fg-muted">Se încarcă...</Text>}
          {!isLoading &&
            (data?.assets.length ?? 0) === 0 &&
            (data?.folders.length ?? 0) === 0 && (
              <Text className="text-ui-fg-muted">Nicio imagine găsită.</Text>
            )}
          <div className="grid grid-cols-6 gap-3">
            {!q &&
              (data?.folders ?? []).map((folder) => (
                <button
                  key={folder}
                  onClick={() => enterFolder(folder)}
                  className="flex flex-col items-center justify-center gap-1.5 aspect-square rounded border border-ui-border-base hover:bg-ui-bg-subtle transition-colors"
                >
                  <Folder className="w-7 h-7 text-ui-fg-subtle" />
                  <Text size="xsmall" className="truncate max-w-[90%] text-ui-fg-subtle">
                    {folder.split("/").filter(Boolean).pop()}
                  </Text>
                </button>
              ))}
            {(data?.assets ?? []).map((asset) => {
              const selected = selectedUrls.includes(asset.url);
              const justUploaded = lastUploadedUrls.has(asset.url);
              return (
                <button
                  key={asset.key}
                  type="button"
                  onClick={() => toggleSelection(asset.url)}
                  title={asset.alt_text ?? asset.key}
                  className={`aspect-square rounded border overflow-hidden transition-shadow ${
                    selected
                      ? "border-ui-border-interactive shadow-outline-interactive"
                      : justUploaded
                        ? "border-ui-fg-positive ring-2 ring-ui-fg-positive"
                        : "border-ui-border-base hover:ring-2 hover:ring-ui-border-interactive"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={asset.url}
                      alt={asset.alt_text ?? ""}
                      className="w-full h-full object-cover"
                    />
                    {justUploaded && !selected && (
                      <div className="absolute top-1 left-1">
                        <Badge size="2xsmall" color="green">
                          Nou
                        </Badge>
                      </div>
                    )}
                    {selected && (
                      <div className="absolute inset-0 bg-black/20 flex items-start justify-end p-1">
                        <div className="bg-ui-bg-base rounded-full w-6 h-6 flex items-center justify-center text-ui-fg-interactive">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-ui-border-base">
          <Text size="small" className="text-ui-fg-muted">
            {selectedUrls.length} imagine{selectedUrls.length === 1 ? " selectată" : " selectate"}
          </Text>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Anulează
            </Button>
            <Button onClick={selectAssets} disabled={selectedUrls.length === 0}>
              Adaugă {selectedUrls.length > 0 ? `${selectedUrls.length}` : "din bibliotecă"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

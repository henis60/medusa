import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Container,
  Drawer,
  Heading,
  IconButton,
  Input,
  Label,
  Text,
  Textarea,
  Tooltip,
  toast,
} from "@medusajs/ui";
import { ArrowsPointingOut, Folder, Link, XMark } from "@medusajs/icons";
import { uploadFiles } from "../../lib/image-upload";
import {
  MediaAsset,
  deleteMediaAsset,
  fetchMediaAssets,
  renameMediaAsset,
  updateMediaAssetMetadata,
} from "../../lib/media-library-api";

function DeleteAssetDialog({
  asset,
  onClose,
  onDeleted,
}: {
  asset: MediaAsset;
  onClose: () => void;
  onDeleted: (permanent: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (permanent: boolean) => {
    setBusy(true);
    try {
      await deleteMediaAsset(asset.key, permanent);
      onDeleted(permanent);
    } catch (err: any) {
      toast.error(err.message || "Ștergere eșuată");
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-ui-bg-base rounded-lg shadow-elevation-modal w-[90vw] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border-base">
          <Heading level="h2">Șterge imaginea</Heading>
          <IconButton variant="transparent" onClick={onClose}>
            <XMark />
          </IconButton>
        </div>
        <div className="px-4 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Alege „Șterge definitiv” pentru a elimina fișierul din R2, sau
            „Ascunde” pentru a-l scoate doar din bibliotecă (rămâne pe
            storage).
          </Text>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-ui-border-base">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Anulează
          </Button>
          <Button variant="secondary" isLoading={busy} onClick={() => run(false)}>
            Ascunde din bibliotecă
          </Button>
          <Button variant="danger" isLoading={busy} onClick={() => run(true)}>
            Șterge definitiv
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ImageLightbox({
  asset,
  onClose,
}: {
  asset: MediaAsset;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <IconButton
        variant="transparent"
        className="absolute top-4 right-4 text-white hover:text-white"
        onClick={onClose}
      >
        <XMark />
      </IconButton>
      <img
        src={asset.url}
        alt={asset.alt_text ?? ""}
        className="max-w-[92vw] max-h-[92vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}

function EditAssetDrawer({
  asset,
  onClose,
}: {
  asset: MediaAsset;
  onClose: () => void;
}) {
  const currentFilename = asset.key.split("/").pop() ?? asset.key;
  const [altText, setAltText] = useState(asset.alt_text ?? "");
  const [tags, setTags] = useState((asset.tags ?? []).join(", "));
  const [filename, setFilename] = useState(currentFilename);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const save = async () => {
    setSaving(true);
    try {
      // Rename first — metadata is keyed by `key`, which changes on rename,
      // so subsequent metadata writes must target the new key.
      let key = asset.key;
      const trimmedFilename = filename.trim();
      if (trimmedFilename && trimmedFilename !== currentFilename) {
        const renamed = await renameMediaAsset(asset.key, trimmedFilename);
        key = renamed.asset.key;
      }
      await updateMediaAssetMetadata(key, {
        alt_text: altText.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      await queryClient.invalidateQueries({ queryKey: ["media-library"] });
      toast.success("Salvat");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Salvare eșuată");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Editează imaginea</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4">
          <img
            src={asset.url}
            alt={asset.alt_text ?? ""}
            className="w-full max-h-64 object-contain rounded border border-ui-border-base"
          />
          <Text size="small" className="text-ui-fg-muted break-all">
            {asset.key}
          </Text>
          <div className="flex flex-col gap-1">
            <Text size="small" weight="plus">
              Nume fișier
            </Text>
            <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
            {asset.linked_products.length > 0 && (
              <Text size="xsmall" className="text-ui-fg-error">
                Atenție: imaginea e folosită de {asset.linked_products.length}{" "}
                {asset.linked_products.length === 1 ? "produs" : "produse"} —
                redenumirea îi schimbă URL-ul și rupe legătura cu acestea.
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Text size="small" weight="plus">
              Text alternativ (alt)
            </Text>
            <Textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Text size="small" weight="plus">
              Taguri (separate prin virgulă)
            </Text>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={save} isLoading={saving}>
            Salvează
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

const MediaLibraryPage = () => {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [prefix, setPrefix] = useState(""); // current folder, e.g. "hoodies/"
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [previewingAsset, setPreviewingAsset] = useState<MediaAsset | null>(null);
  const [unlinkedOnly, setUnlinkedOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [convert, setConvert] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Debounce search input — without this, every keystroke fired a fresh R2
  // ListObjectsV2 call, which was a large chunk of the reported slowness.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setCursor(undefined);
      setCursorHistory([]);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["media-library", q, prefix, cursor, unlinkedOnly],
    queryFn: () =>
      fetchMediaAssets({
        limit: 48,
        q: q || undefined,
        prefix,
        cursor,
        unlinked: unlinkedOnly,
      }),
  });

  const enterFolder = (folder: string) => {
    setPrefix(folder);
    setSearch("");
    setQ("");
    setCursor(undefined);
    setCursorHistory([]);
  };

  // Breadcrumb segments for the current folder path, each clickable to jump
  // back up to that level ("" = bucket root).
  const breadcrumbs = prefix
    ? prefix
        .split("/")
        .filter(Boolean)
        .map((segment, i, arr) => ({
          label: segment,
          path: arr.slice(0, i + 1).join("/") + "/",
        }))
    : [];

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      await uploadFiles(files, convert, "/admin/media-library", {
        folder: prefix.replace(/\/$/, ""),
      });
      await queryClient.invalidateQueries({ queryKey: ["media-library"] });
      toast.success(`${files.length} imagini încărcate`);
    } catch (err: any) {
      toast.error(err.message || "Upload eșuat");
    } finally {
      setUploading(false);
    }
  };

  // Folders are created implicitly by uploading into them — this just
  // navigates into a not-yet-existing path so the next upload lands there.
  const createFolder = () => {
    const name = newFolderName.trim().replace(/[/\\]+/g, "-");
    if (!name) return;
    enterFolder(`${prefix}${name}/`);
    setNewFolderName("");
  };

  const handleDeleted = async (permanent: boolean) => {
    setDeletingAsset(null);
    await queryClient.invalidateQueries({ queryKey: ["media-library"] });
    toast.success(permanent ? "Șters definitiv din R2" : "Ascuns din bibliotecă");
  };

  const goNext = () => {
    if (!data?.nextCursor) return;
    setCursorHistory((h) => [...h, cursor]);
    setCursor(data.nextCursor);
  };
  const goPrev = () => {
    setCursorHistory((h) => {
      const next = [...h];
      const prev = next.pop();
      setCursor(prev);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-y-4 p-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Bibliotecă de imagini</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Imaginile din bucketul R2 — inclusiv cele încărcate direct, în afara
            admin-ului.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="library-convert"
              checked={convert}
              onCheckedChange={(v) => setConvert(!!v)}
            />
            <Label htmlFor="library-convert" className="text-xs">
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
          <Button
            size="small"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
          >
            Încarcă imagini
          </Button>
        </div>
      </div>

      <Container className="px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Caută după nume fișier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Checkbox
              id="unlinked-only"
              checked={unlinkedOnly}
              onCheckedChange={(v) => {
                setUnlinkedOnly(!!v);
                setCursor(undefined);
                setCursorHistory([]);
              }}
            />
            <Label htmlFor="unlinked-only" className="text-xs">
              Doar neasociate unui produs
            </Label>
          </div>
        </div>
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
      </Container>

      <Container className="p-4">
        {isLoading && <Text className="text-ui-fg-muted">Se încarcă...</Text>}
        {!isLoading &&
          (data?.assets.length ?? 0) === 0 &&
          (data?.folders.length ?? 0) === 0 && (
            <Text className="text-ui-fg-muted">Nicio imagine găsită.</Text>
          )}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {!q &&
            (data?.folders ?? []).map((folder) => (
              <button
                key={folder}
                onClick={() => enterFolder(folder)}
                className="flex flex-col items-center justify-center gap-1.5 aspect-square rounded border border-ui-border-base hover:bg-ui-bg-subtle transition-colors"
              >
                <Folder className="w-8 h-8 text-ui-fg-subtle" />
                <Text size="xsmall" className="truncate max-w-[90%] text-ui-fg-subtle">
                  {folder.split("/").filter(Boolean).pop()}
                </Text>
              </button>
            ))}
          {(data?.assets ?? []).map((asset) => (
            <div
              key={asset.key}
              className="group relative rounded border border-ui-border-base overflow-hidden"
            >
              <button
                className="block w-full aspect-square"
                onClick={() => setEditingAsset(asset)}
                title="Editează metadate"
              >
                <img
                  src={asset.url}
                  alt={asset.alt_text ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>

              {asset.linked_products.length > 0 && (
                <Tooltip
                  content={
                    <div className="flex flex-col gap-0.5">
                      {asset.linked_products.map((p) => (
                        <span key={p.id}>{p.title}</span>
                      ))}
                    </div>
                  }
                >
                  <div className="absolute top-1 left-1 bg-ui-bg-base border border-ui-border-base rounded-full w-6 h-6 flex items-center justify-center text-ui-fg-subtle">
                    <Link className="w-3.5 h-3.5" />
                  </div>
                </Tooltip>
              )}

              <button
                className="absolute top-1 right-9 bg-ui-bg-base border border-ui-border-base rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-ui-fg-subtle"
                onClick={() => setPreviewingAsset(asset)}
                title="Previzualizare"
              >
                <ArrowsPointingOut className="w-3.5 h-3.5" />
              </button>
              <button
                className="absolute top-1 right-1 bg-ui-bg-base border border-ui-border-base rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-ui-fg-subtle hover:text-ui-fg-error"
                onClick={() => setDeletingAsset(asset)}
                title="Șterge"
              >
                <XMark className="w-3.5 h-3.5" />
              </button>

              <div className="p-1.5 bg-ui-bg-base">
                <Text size="xsmall" className="truncate text-ui-fg-subtle">
                  {asset.key.split("/").pop()}
                </Text>
                {asset.alt_text && (
                  <Text size="xsmall" className="truncate text-ui-fg-muted">
                    {asset.alt_text}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>

        {(cursorHistory.length > 0 || data?.nextCursor) && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              size="small"
              variant="secondary"
              disabled={cursorHistory.length === 0}
              onClick={goPrev}
            >
              Înapoi
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={!data?.nextCursor}
              onClick={goNext}
            >
              Înainte
            </Button>
          </div>
        )}
      </Container>

      {editingAsset && (
        <EditAssetDrawer
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
        />
      )}
      {deletingAsset && (
        <DeleteAssetDialog
          asset={deletingAsset}
          onClose={() => setDeletingAsset(null)}
          onDeleted={handleDeleted}
        />
      )}
      {previewingAsset && (
        <ImageLightbox
          asset={previewingAsset}
          onClose={() => setPreviewingAsset(null)}
        />
      )}
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Bibliotecă imagini",
});

export default MediaLibraryPage;

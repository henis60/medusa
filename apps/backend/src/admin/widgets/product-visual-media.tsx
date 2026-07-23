import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  IconButton,
  Popover,
  Text,
  toast,
} from "@medusajs/ui";
import { StarSolid, Tag, XMark } from "@medusajs/icons";
import { sdk } from "../lib/client";
import MediaLibraryPicker from "../components/media-library-picker";

// Medusa images with zero explicit variant links are "general" — Medusa's own
// getVariantImages() (in @medusajs/product) shows them on every variant until
// the image is explicitly linked to specific ones, at which point it becomes
// exclusive to those. So `variants` here (fetched from the IMAGE side) is the
// only reliable signal for "explicitly assigned" — fetching from the variant
// side instead would make every general image look pre-checked everywhere.
type MediaImage = {
  id: string;
  url: string;
  variants: { id: string; title: string }[];
};
type MediaVariant = {
  id: string;
  title: string;
  options: { value: string; option: { title: string } }[];
};

// Same convention the storefront uses to find the "color" option (see
// COLOR_OPTION_NAMES in apps/storefront/src/lib/util/product.ts) — matching
// it here means "Asociază variante" groups by color instead of listing every
// color+size combination as its own row.
const COLOR_OPTION_NAMES = ["culoare", "color", "colour"];

function colorValueOf(variant: MediaVariant): string | null {
  const opt = variant.options.find((o) =>
    COLOR_OPTION_NAMES.includes(o.option.title.trim().toLowerCase()),
  );
  return opt?.value ?? null;
}

type ColorGroup = { label: string; variantIds: string[] };

function groupByColor(variants: MediaVariant[]): ColorGroup[] {
  const groups = new Map<string, ColorGroup>();
  for (const variant of variants) {
    const color = colorValueOf(variant);
    if (!color) continue;
    const existing = groups.get(color);
    if (existing) {
      existing.variantIds.push(variant.id);
    } else {
      groups.set(color, { label: color, variantIds: [variant.id] });
    }
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function ConfirmRemoveDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-ui-bg-base rounded-lg shadow-elevation-modal w-[90vw] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border-base">
          <Heading level="h2">Șterge din produs</Heading>
          <IconButton variant="transparent" onClick={onClose}>
            <XMark />
          </IconButton>
        </div>
        <div className="px-4 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Imaginea rămâne în bibliotecă, doar se detașează de acest produs.
          </Text>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-ui-border-base">
          <Button variant="secondary" onClick={onClose}>
            Anulează
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Șterge
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Replaces Medusa's built-in Media card (hidden by the
// hide-builtin-media-section widget) with reordering, delete, and per-image
// variant assignment — none of which the built-in card supports. Fetches its
// own product detail (rather than trusting the `data` prop's fields) so the
// data this widget needs is guaranteed present regardless of what fields the
// main product page happens to request.
const ProductVisualMediaWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [removingImage, setRemovingImage] = useState<MediaImage | null>(null);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["product-visual-media", product.id],
    queryFn: () =>
      sdk.client.fetch<{
        product: {
          id: string;
          thumbnail: string | null;
          images: MediaImage[];
          variants: MediaVariant[];
        };
      }>(
        `/admin/products/${product.id}?fields=id,thumbnail,images.*,images.variants.*,variants.id,variants.title,variants.options.value,variants.options.option.title`,
      ),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["product-visual-media", product.id],
    });
    // Medusa's dashboard caches product detail under ["products", "detail", id, ...].
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const images = data?.product.images ?? [];
  const variants = data?.product.variants ?? [];
  const colorGroups = groupByColor(variants);
  // Products with no color option (e.g. size-only) have nothing to group —
  // fall back to raw variants so assignment is still possible.
  const hasColorOption = colorGroups.length > 0;
  const thumbnail = data?.product.thumbnail;

  const saveImages = async (
    nextImages: MediaImage[],
    nextThumbnail?: string | null,
  ) => {
    setBusy(true);
    try {
      await sdk.client.fetch(`/admin/products/${product.id}`, {
        method: "POST",
        body: {
          // Only existing images carry a real id — new ones must omit the key
          // entirely (an empty string is still a truthy-shaped value to the
          // upsert and can confuse "is this new or existing" resolution).
          images: nextImages.map((img) =>
            img.id ? { id: img.id, url: img.url } : { url: img.url },
          ),
          ...(nextThumbnail !== undefined ? { thumbnail: nextThumbnail } : {}),
        },
      });
      await refresh();
    } catch (err: any) {
      toast.error(err.message || "Actualizare eșuată");
    } finally {
      setBusy(false);
    }
  };

  const addFromLibrary = async (url: string) => {
    setPickerOpen(false);
    if (images.some((img) => img.url === url)) {
      toast.info("Imaginea este deja atașată produsului");
      return;
    }
    await saveImages(
      [...images, { id: "", url, variants: [] }],
      thumbnail ?? url,
    );
  };

  const removeImage = async (image: MediaImage) => {
    setRemovingImage(null);
    const remaining = images.filter((img) => img.id !== image.id);
    const wasThumbnail = thumbnail === image.url;
    await saveImages(
      remaining,
      wasThumbnail ? (remaining[0]?.url ?? "") : undefined,
    );
  };

  const makeThumbnail = async (image: MediaImage) => {
    await saveImages(images, image.url);
  };

  const reorder = async (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    await saveImages(next);
  };

  const toggleVariants = async (
    imageId: string,
    variantIds: string[],
    checked: boolean,
  ) => {
    setBusy(true);
    try {
      await sdk.client.fetch(
        `/admin/products/${product.id}/images/${imageId}/variants/batch`,
        {
          method: "POST",
          body: checked
            ? { add: variantIds, remove: [] }
            : { add: [], remove: variantIds },
        },
      );
      await refresh();
    } catch (err: any) {
      toast.error(err.message || "Asociere eșuată");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Not "Media" — the hide-builtin-media-section widget hides any h2
            with that exact text, which would hide this card too. */}
        <Heading level="h2">Galerie media</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setPickerOpen(true)}
        >
          Adaugă din bibliotecă
        </Button>
      </div>

      {isLoading && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-muted">
            Se încarcă...
          </Text>
        </div>
      )}

      {!isLoading && images.length === 0 && (
        <div className="flex flex-col items-center gap-y-2 px-6 py-8">
          <Text size="small" className="text-ui-fg-muted">
            Încă nu există media pentru acest produs.
          </Text>
        </div>
      )}

      {!isLoading && images.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 px-6 py-4">
          {images.map((image, index) => {
            // Explicit assignment only — an image with no variant links at
            // all is "general" (shown everywhere by Medusa's own logic), not
            // "assigned to every variant", so nothing should read as checked.
            const explicitVariantIds = new Set(
              (image.variants ?? []).map((v) => v.id),
            );
            return (
              <div
                key={image.id || image.url}
                draggable={!busy}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) reorder(dragIndex, index);
                  setDragIndex(null);
                }}
                className="group relative aspect-square rounded-[8px] overflow-hidden border border-ui-border-base cursor-grab active:cursor-grabbing"
              >
                <img
                  src={image.url}
                  alt=""
                  className="size-full object-cover"
                />

                {image.url === thumbnail && (
                  <div className="absolute left-2 top-2">
                    <Badge size="2xsmall" color="blue">
                      <StarSolid className="w-3 h-3" />
                    </Badge>
                  </div>
                )}

                <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    size="small"
                    disabled={busy}
                    onClick={() => setRemovingImage(image)}
                    title="Șterge din produs"
                    className="bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base-hover"
                  >
                    <XMark />
                  </IconButton>
                  {image.url !== thumbnail && (
                    <IconButton
                      size="small"
                      disabled={busy}
                      onClick={() => makeThumbnail(image)}
                      title="Setează ca miniatură"
                      className="bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base-hover"
                    >
                      <StarSolid />
                    </IconButton>
                  )}
                  {!!image.id && variants.length > 0 && (
                    <Popover>
                      <Popover.Trigger asChild>
                        <IconButton
                          size="small"
                          disabled={busy}
                          title={hasColorOption ? "Asociază culori" : "Asociază variante"}
                          className="bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base-hover"
                        >
                          <Tag />
                        </IconButton>
                      </Popover.Trigger>
                      <Popover.Content className="p-2 max-h-64 overflow-y-auto w-56">
                        <Text
                          size="xsmall"
                          weight="plus"
                          className="px-2 pb-1 text-ui-fg-subtle"
                        >
                          {hasColorOption ? "Asociază culori" : "Asociază variante"}
                        </Text>
                        {hasColorOption
                          ? colorGroups.map((group) => {
                              const checked = group.variantIds.every((id) =>
                                explicitVariantIds.has(id),
                              );
                              return (
                                <label
                                  key={group.label}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-ui-bg-subtle cursor-pointer"
                                >
                                  <Checkbox
                                    checked={checked}
                                    disabled={busy}
                                    onCheckedChange={(v) =>
                                      toggleVariants(image.id, group.variantIds, !!v)
                                    }
                                  />
                                  <Text size="small">{group.label}</Text>
                                </label>
                              );
                            })
                          : variants.map((variant) => {
                              const checked = explicitVariantIds.has(variant.id);
                              return (
                                <label
                                  key={variant.id}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-ui-bg-subtle cursor-pointer"
                                >
                                  <Checkbox
                                    checked={checked}
                                    disabled={busy}
                                    onCheckedChange={(v) =>
                                      toggleVariants(image.id, [variant.id], !!v)
                                    }
                                  />
                                  <Text size="small">{variant.title}</Text>
                                </label>
                              );
                            })}
                      </Popover.Content>
                    </Popover>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pickerOpen && (
        <MediaLibraryPicker
          onClose={() => setPickerOpen(false)}
          onSelect={addFromLibrary}
        />
      )}
      {removingImage && (
        <ConfirmRemoveDialog
          onClose={() => setRemovingImage(null)}
          onConfirm={() => removeImage(removingImage)}
        />
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductVisualMediaWidget;

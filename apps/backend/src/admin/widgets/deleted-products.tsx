import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Text, Heading, Button, Badge, toast } from "@medusajs/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { sdk } from "../lib/client";

type DeletedProduct = {
  id: string;
  title: string;
  handle: string | null;
  thumbnail: string | null;
  status: string;
  deleted_at: string;
};

// Soft-deleted products disappear from the regular product list with no
// trace — there was previously no way to see them, or clear them out for
// good, short of a direct DB edit. This surfaces them above the list with
// a permanent-delete action (no restore: a restored product would come back
// with no sales channel and no inventory items, since that cleanup already
// ran at soft-delete time — not a real "undo").
const DeletedProductsWidget = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["deleted-products"],
    queryFn: () =>
      sdk.client.fetch<{ products: DeletedProduct[]; count: number }>(
        "/admin/deleted-products"
      ),
  });

  const permanentDelete = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/deleted-products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, id) => {
      const product = data?.products.find((p) => p.id === id);
      queryClient.invalidateQueries({ queryKey: ["deleted-products"] });
      toast.success(`${product?.title ?? "Produsul"} a fost șters definitiv`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ștergerea a eșuat");
    },
  });

  const handlePermanentDelete = (product: DeletedProduct) => {
    // window.confirm is a deliberate choice here, not a placeholder — this
    // is the one irreversible action on the page, and @medusajs/ui has no
    // confirmation-dialog component to reach for.
    if (
      window.confirm(
        `Ștergi definitiv "${product.title}"? Această acțiune nu poate fi anulată.`
      )
    ) {
      permanentDelete.mutate(product.id);
    }
  };

  const count = data?.count ?? 0;
  if (!isLoading && count === 0) return null;

  return (
    <Container className="p-0 divide-y divide-ui-border-base">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <Heading level="h2">Produse șterse</Heading>
          {!isLoading && <Badge size="2xsmall">{count}</Badge>}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {open ? "Ascunde" : "Arată"}
        </Text>
      </button>

      {open && (
        <div className="divide-y divide-ui-border-base">
          {data?.products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between px-6 py-3 gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {product.thumbnail && (
                  <img
                    src={product.thumbnail}
                    alt=""
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <div className="min-w-0">
                  <Text size="small" weight="plus" className="truncate">
                    {product.title}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Șters la {new Date(product.deleted_at).toLocaleString("ro-RO")}
                  </Text>
                </div>
              </div>
              <Button
                size="small"
                variant="danger"
                isLoading={
                  permanentDelete.isPending &&
                  permanentDelete.variables === product.id
                }
                onClick={() => handlePermanentDelete(product)}
              >
                Șterge definitiv
              </Button>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default DeletedProductsWidget;

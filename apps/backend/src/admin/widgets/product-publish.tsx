import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { Container, Button, Text, toast } from "@medusajs/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../lib/client";

// Sits next to the "Pagina produsului" widget (product-preview.tsx), same
// zone — that one only ever offers a *preview* link (for "proposed"/
// "published" products); nothing on the product detail page itself let you
// actually publish a draft/proposed product without going through the bulk
// AI-import table's own "Publică" button. This is that same action, exposed
// here too.
const ProductPublishWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient();
  const status = (product as any).status;

  const publish = useMutation({
    mutationFn: () =>
      sdk.admin.product.update(product.id, { status: "published" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${product.title} a fost publicat`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Publicarea a eșuat");
    },
  });

  if (status === "published") return null;

  return (
    <Container className="flex items-center justify-between px-6 py-4">
      <div>
        <Text size="small" weight="plus">
          Publicare
        </Text>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Produsul este momentan {status === "proposed" ? "propus" : "ciornă"} —
          nu este vizibil pe storefront.
        </Text>
      </div>
      <Button
        size="small"
        variant="primary"
        isLoading={publish.isPending}
        onClick={() => publish.mutate()}
      >
        Publică
      </Button>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductPublishWidget;

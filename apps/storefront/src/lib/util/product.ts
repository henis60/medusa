import { HttpTypes } from "@medusajs/types";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

export const isInStoreOnly = (product: HttpTypes.StoreProduct): boolean => {
    return product.type?.value === "in-store-only"
}
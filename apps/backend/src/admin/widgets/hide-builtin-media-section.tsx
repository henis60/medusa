import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useEffect } from "react";

// HACK, not a supported Medusa customization API: widget zones can only add
// content before/after existing sections, they can't remove one — and the
// built-in product Media card (upload/reorder/delete, at /products/:id/media)
// has no id/data-testid/stable class to target with CSS either. This finds
// it at runtime by its heading text ("Media", same in en/ro) and hides its
// nearest Container ancestor, replaced by the custom media manager widget.
//
// FRAGILE: relies on Medusa always rendering an <h2>"Media"</h2> for this
// section. If a Medusa dashboard upgrade changes that text or DOM structure,
// this silently stops hiding the built-in card (fails open, not closed) —
// re-check after upgrading @medusajs/dashboard.
function hideBuiltInMediaSection() {
  document.querySelectorAll("h2").forEach((heading) => {
    if (heading.textContent?.trim() !== "Media") return;
    const container = heading.closest(".divide-y") as HTMLElement | null;
    if (container && container.style.display !== "none") {
      container.style.display = "none";
    }
  });
}

const HideBuiltinMediaSectionWidget = () => {
  useEffect(() => {
    hideBuiltInMediaSection();
    const observer = new MutationObserver(() => hideBuiltInMediaSection());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default HideBuiltinMediaSectionWidget;

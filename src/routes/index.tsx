import { createFileRoute } from "@tanstack/react-router";
import { AdminEntry } from "@/components/admin-entry";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scentology BD — Private Atelier" },
      { name: "description", content: "The private Scentology BD atelier. Scented your mood." },
      { property: "og:title", content: "Scentology BD — Private Atelier" },
      {
        property: "og:description",
        content: "The private Scentology BD atelier. Scented your mood.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEntry,
});

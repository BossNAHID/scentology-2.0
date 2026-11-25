import { createFileRoute } from "@tanstack/react-router";
import { AdminEntry } from "@/components/admin-entry";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Scentology BD — Administration" },
      { name: "description", content: "Secure private administration for Scentology BD." },
      { property: "og:title", content: "Scentology BD — Administration" },
      { property: "og:description", content: "Secure private administration for Scentology BD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEntry,
});

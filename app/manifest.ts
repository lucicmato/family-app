import type { MetadataRoute } from "next";

// PWA manifest — served at /manifest.webmanifest, enables "Add to Home Screen"
const manifest = (): MetadataRoute.Manifest => ({
  name: "Obiteljska aplikacija",
  short_name: "Obitelj",
  description: "Zajednički popis svakodnevnih zadataka.",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#18181b",
  lang: "hr",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
});

export default manifest;

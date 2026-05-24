import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lenvx",
    short_name: "Lenvx",
    description: "lenvx's personal site",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/pfp.png", sizes: "any", type: "image/png" },
    ],
  };
}

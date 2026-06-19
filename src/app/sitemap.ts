import type { MetadataRoute } from "next";

const baseUrl = "https://picksproai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/resultados`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/estadisticas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/metodologia`, changeFrequency: "monthly", priority: 0.7 },
  ];
}

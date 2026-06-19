import type { MetadataRoute } from "next";

const baseUrl = "https://picksproai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/resultados`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/estadisticas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rendimiento-ligas`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/metodologia`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/legal`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/juego-responsable`, changeFrequency: "yearly", priority: 0.5 },
  ];
}

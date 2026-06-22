import type { MetadataRoute } from "next";
import { getLeaguePerformances } from "../lib/league-performance";

const baseUrl = "https://picksproai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/resultados`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/estadisticas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rendimiento-ligas`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/metodologia`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/legal`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/juego-responsable`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const leaguePages: MetadataRoute.Sitemap = getLeaguePerformances().map((league) => ({
    url: `${baseUrl}/ligas/${league.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...leaguePages];
}

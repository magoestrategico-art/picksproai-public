import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://picksproai.com"),
  title: {
    default: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    template: "%s | PicksProAI",
  },
  description: "PicksProAI publica picks de fútbol basados en análisis estadístico, resultados históricos auditables, ROI, porcentaje de acierto y transparencia completa.",
  keywords: [
    "pronósticos de fútbol",
    "picks de fútbol",
    "estadísticas de fútbol",
    "ROI apuestas deportivas",
    "resultados históricos",
    "análisis estadístico de fútbol",
    "PicksProAI",
  ],
  applicationName: "PicksProAI",
  openGraph: {
    title: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    description: "Picks de fútbol con análisis estadístico, resultados históricos auditables, ROI y transparencia completa.",
    url: "/",
    siteName: "PicksProAI",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    description: "Picks de fútbol con análisis estadístico, resultados auditables, ROI y transparencia completa.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <nav className="container site-nav" aria-label="Navegación principal">
            <Link className="site-brand" href="/">Picks Pro <span>AI</span></Link>
            <div className="site-nav__links">
              <Link href="/">Inicio</Link>
              <Link href="/resultados">Resultados</Link>
              <Link href="/estadisticas">Estadísticas</Link>
              <Link href="/metodologia">Metodología</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

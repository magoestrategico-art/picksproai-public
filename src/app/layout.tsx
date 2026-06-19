import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  // Google Search Console verification:
  // verification: {
  //   google: "PENDIENTE_DE_CODIGO_GOOGLE",
  // },
  openGraph: {
    title: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    description: "Picks de fútbol con análisis estadístico, resultados históricos auditables, ROI y transparencia completa.",
    url: "/",
    siteName: "PicksProAI",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PicksProAI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    description: "Picks de fútbol con análisis estadístico, resultados auditables, ROI y transparencia completa.",
    images: ["/og-image.png"],
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
              <Link href="/legal">Legal</Link>
              <Link href="/juego-responsable">Juego responsable</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container site-footer__inner">
            <div>
              <Link className="site-brand" href="/">Picks Pro <span>AI</span></Link>
              <p>© PicksProAI 2026</p>
            </div>
            <nav className="site-footer__links" aria-label="Enlaces legales">
              <Link href="/metodologia">Metodología</Link>
              <Link href="/legal">Legal</Link>
              <Link href="/juego-responsable">Juego Responsable</Link>
            </nav>
          </div>
          <div className="container site-footer__notice">Contenido destinado exclusivamente a mayores de 18 años.</div>
        </footer>
        <GoogleAnalytics gaId="G-P85RJSTNZE" />
      </body>
    </html>
  );
}

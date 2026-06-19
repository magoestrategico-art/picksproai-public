import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Picks Pro AI",
  description: "Predicciones deportivas basadas en datos históricos.",
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

import type { Metadata } from "next";
import Link from "next/link";
import { getLeaguePerformances } from "../../lib/league-performance";

export const metadata: Metadata = {
  title: "Rendimiento por ligas",
  description: "Estadísticas históricas y rendimiento por liga de los picks publicados en PicksProAI.",
  alternates: { canonical: "/rendimiento-ligas" },
  openGraph: {
    title: "Rendimiento por ligas | PicksProAI",
    description: "Estadísticas históricas, acierto, ROI y beneficio de PicksProAI agrupados por liga.",
    url: "/rendimiento-ligas",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PicksProAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rendimiento por ligas | PicksProAI",
    description: "Acierto, ROI y beneficio histórico de los picks agrupados por liga.",
    images: ["/og-image.png"],
  },
};

function formatPercentage(value: number | null, signed = false) {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return `${signed && value >= 0 ? "+" : ""}${formatted} %`;
}

function formatUnits(value: number) {
  const formatted = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${value >= 0 ? "+" : ""}${formatted} u`;
}

export default function LeaguePerformancePage() {
  const leagues = getLeaguePerformances();
  const totalResolved = leagues.reduce((total, league) => total + league.resolved, 0);

  return (
    <main>
      <header className="page-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Análisis por competición</span>
          <h1>Rendimiento por ligas</h1>
          <p>Comparativa histórica de acierto, rentabilidad y beneficio de los picks publicados.</p>
        </div>
      </header>

      <div className="container results-content league-performance-content">
        <section aria-labelledby="league-summary-title">
          <div className="section-heading"><div><span className="section-kicker">Cobertura histórica</span><h2 id="league-summary-title">Resumen por ligas</h2></div></div>
          <div className="league-summary-grid">
            <article className="stat-card"><span>Ligas analizadas</span><strong>{leagues.length}</strong><small>Competiciones con resultados</small></article>
            <article className="stat-card"><span>Picks resueltos</span><strong>{totalResolved}</strong><small>Histórico público completo</small></article>
          </div>
        </section>

        <section className="statistics-section" aria-labelledby="league-table-title">
          <div className="section-heading">
            <div><span className="section-kicker">Detalle</span><h2 id="league-table-title">Comparativa de rendimiento</h2></div>
            <span className="pick-count">Ordenado por picks resueltos</span>
          </div>
          <div className="results-table-wrap">
            <table className="results-table league-performance-table">
              <thead><tr><th>Liga</th><th>Resueltos</th><th>Ganados</th><th>Perdidos</th><th>Acierto</th><th>ROI</th><th>Beneficio</th></tr></thead>
              <tbody>
                {leagues.map((league) => (
                  <tr key={league.slug}>
                    <td data-label="Liga"><Link className="league-table-link" href={`/ligas/${league.slug}`}>{league.league}<span aria-hidden="true">→</span></Link></td>
                    <td data-label="Resueltos">{league.resolved}</td>
                    <td data-label="Ganados">{league.won}</td>
                    <td data-label="Perdidos">{league.lost}</td>
                    <td data-label="Acierto">{formatPercentage(league.hitRate)}</td>
                    <td data-label="ROI"><strong className={league.roi >= 0 ? "positive" : "negative"}>{formatPercentage(league.roi, true)}</strong></td>
                    <td data-label="Beneficio"><strong className={league.profit >= 0 ? "positive" : "negative"}>{formatUnits(league.profit)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

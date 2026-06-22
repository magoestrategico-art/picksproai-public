import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeaguePerformance, getLeaguePerformances } from "../../../lib/league-performance";

type LeaguePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLeaguePerformances().map((league) => ({ slug: league.slug }));
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = getLeaguePerformance(slug);
  if (!league) return { title: "Liga no encontrada", robots: { index: false, follow: false } };

  const title = `${league.league} | Rendimiento histórico | PicksProAI`;
  const description = `Estadísticas históricas, ROI, porcentaje de acierto y rendimiento de los picks publicados para ${league.league}.`;
  const url = `/ligas/${league.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PicksProAI" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

function formatPercentage(value: number | null, signed = false) {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return `${signed && value >= 0 ? "+" : ""}${formatted} %`;
}

function formatUnits(value: number) {
  const formatted = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${value >= 0 ? "+" : ""}${formatted} u`;
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { slug } = await params;
  const league = getLeaguePerformance(slug);
  if (!league) notFound();

  const metrics = [
    ["Picks resueltos", league.resolved, "Histórico publicado"],
    ["Ganados", league.won, "Resultados positivos"],
    ["Perdidos", league.lost, "Resultados negativos"],
    ["Acierto", formatPercentage(league.hitRate), "Sobre ganados y perdidos"],
    ["ROI", formatPercentage(league.roi, true), "Stake fijo de 1 unidad"],
    ["Beneficio neto", formatUnits(league.profit), "Unidades acumuladas"],
  ];

  return (
    <main>
      <header className="page-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/rendimiento-ligas">← Todas las ligas</Link>
          <span className="eyebrow"><i /> Rendimiento histórico</span>
          <h1>{league.league}</h1>
          <p>Estadísticas públicas de los picks resueltos para {league.league}, calculadas automáticamente desde el histórico verificable de PicksProAI.</p>
        </div>
      </header>

      <div className="container results-content">
        <section aria-labelledby="league-metrics-title">
          <div className="section-heading"><div><span className="section-kicker">Datos verificados</span><h2 id="league-metrics-title">Resumen de rendimiento</h2></div></div>
          <div className="results-stats">
            {metrics.map(([label, value, note]) => (
              <article className="stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
            ))}
          </div>
        </section>

        <section className="statistics-section methodology-card methodology-card--wide methodology-card--accent" aria-labelledby="league-links-title">
          <span className="methodology-card__number">→</span>
          <div>
            <span className="section-kicker">Seguir explorando</span>
            <h2 id="league-links-title">Consulta el histórico completo</h2>
            <p>Compara estos datos con todos los resultados, las estadísticas generales y el resto de competiciones analizadas.</p>
            <div className="methodology-actions">
              <Link className="button-link" href="/resultados">Ver resultados</Link>
              <Link className="button-link button-link--secondary" href="/estadisticas">Ver estadísticas</Link>
              <Link className="button-link button-link--secondary" href="/rendimiento-ligas">Rendimiento por ligas</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

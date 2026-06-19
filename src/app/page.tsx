import type { Metadata } from "next";
import Link from "next/link";
import picksData from "../../public/data/public_picks.json";
import resultsData from "../../public/data/public_results.json";

export const metadata: Metadata = {
  title: { absolute: "PicksProAI | Pronósticos de fútbol con estadísticas verificables" },
  description: "Picks de fútbol activos basados en análisis estadístico, probabilidades y valor esperado positivo.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    description: "Consulta picks de fútbol activos basados en datos, probabilidades y valor esperado.",
    url: "/",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PicksProAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PicksProAI | Pronósticos de fútbol con estadísticas verificables",
    description: "Picks de fútbol activos basados en datos, probabilidades y valor esperado.",
    images: ["/og-image.png"],
  },
};

type Pick = {
  id: string | number;
  fecha: string;
  liga: string;
  local: string;
  visitante: string;
  mercado: string;
  seleccion: string;
  cuota: number;
  probabilidad: number;
  ev: number;
  categoria: string;
  estado: string;
};

const picks = picksData as Pick[];
const historicalResults = resultsData as Pick[];

const formatDate = (date: string) => {
  const parsedDate = new Date(date.includes("T") ? date : `${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    ...(date.includes("T") && { hour: "2-digit", minute: "2-digit" }),
  }).format(parsedDate);
};

const parseHistoricalDate = (date: string) => {
  const shortDate = /^(\d{2})\.(\d{2})$/.exec(date);
  if (shortDate) return new Date(2026, Number(shortDate[2]) - 1, Number(shortDate[1]), 0, 0);
  return new Date(date.includes("T") ? date : `${date}T00:00:00`);
};

const formatPercentage = (value: number, signed = false) =>
  `${signed && value >= 0 ? "+" : ""}${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} %`;

export default function Home() {
  const publicPicks = picks;
  const results = historicalResults.map((result) => ({
    ...result,
    normalizedStatus: result.estado.trim().toLowerCase(),
  }));
  const won = results.filter((result) => ["won", "acertado"].includes(result.normalizedStatus)).length;
  const lost = results.filter((result) => ["lost", "fallado"].includes(result.normalizedStatus)).length;
  const settled = won + lost;
  const hitRate = settled > 0 ? (won / settled) * 100 : 0;
  const netProfit = results.reduce((total, result) => {
    if (["won", "acertado"].includes(result.normalizedStatus)) return total + result.cuota - 1;
    if (["lost", "fallado"].includes(result.normalizedStatus)) return total - 1;
    return total;
  }, 0);
  const roi = results.length > 0 ? (netProfit / results.length) * 100 : 0;
  const latestDate = results.reduce<Date | null>((latest, result) => {
    const current = parseHistoricalDate(result.fecha);
    if (Number.isNaN(current.getTime())) return latest;
    return latest === null || current > latest ? current : latest;
  }, null);
  const lastUpdated = latestDate
    ? new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(latestDate).replace(",", "")
    : "Sin datos";

  const trustMetrics = [
    { label: "Picks resueltos", value: results.length, note: "Histórico público" },
    { label: "Ganados", value: won, note: "Resultados positivos" },
    { label: "Perdidos", value: lost, note: "Resultados negativos" },
    { label: "Acierto", value: formatPercentage(hitRate), note: "Sobre ganados y perdidos" },
    { label: "ROI", value: formatPercentage(roi, true), note: "Stake fijo de 1 unidad", positive: roi >= 0 },
    { label: "Beneficio neto", value: `${netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)} u`, note: "Unidades acumuladas", positive: netProfit >= 0 },
  ];

  return (
    <main>
      <header className="hero">
        <div className="hero__glow" />
        <div className="container hero__content">
          <span className="eyebrow"><i /> Inteligencia aplicada al deporte</span>
          <h1>Picks Pro <span>AI</span></h1>
          <p>Predicciones deportivas basadas en datos históricos.</p>
          <div className="hero-actions">
            <Link className="button-link" href="/resultados">Ver resultados</Link>
            <Link className="button-link button-link--secondary" href="/estadisticas">Ver estadísticas</Link>
          </div>
        </div>
      </header>

      <div className="container content">
        <section className="trust-section" aria-labelledby="stats-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Histórico verificado</span>
              <h2 id="stats-title">Rendimiento público</h2>
            </div>
            <span className="last-updated"><i /> Última actualización: {lastUpdated}</span>
          </div>

          <div className="trust-stats">
            {trustMetrics.map((metric) => (
              <article className="stat-card trust-stat-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong className={metric.positive === undefined ? "" : metric.positive ? "positive" : "negative"}>{metric.value}</strong>
                <small>{metric.note}</small>
              </article>
            ))}
          </div>

          <div className="trust-summary">
            <div>
              <span className="trust-summary__label">Transparencia en datos</span>
              <p>Histórico verificado de <strong>{results.length} picks resueltos</strong> con <strong>{formatPercentage(hitRate)} de acierto</strong> y ROI de <strong className={roi >= 0 ? "positive" : "negative"}>{formatPercentage(roi, true)}</strong>.</p>
            </div>
            <div className="trust-summary__actions">
              <Link className="button-link" href="/resultados">Ver resultados</Link>
              <Link className="button-link button-link--secondary" href="/estadisticas">Ver estadísticas</Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="picks-title" className="picks-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Selecciones</span>
              <h2 id="picks-title">Picks activos</h2>
            </div>
            <span className="pick-count">{publicPicks.length} disponibles</span>
          </div>

          {publicPicks.length > 0 ? (
            <div className="picks-grid">
              {publicPicks.map((pick) => (
                <article className="pick-card" key={pick.id}>
                  <div className="pick-card__top">
                    <div>
                      <span className="category">{pick.categoria}</span>
                      <span className="league">{pick.liga}</span>
                    </div>
                    <span className="status"><i /> {pick.estado}</span>
                  </div>

                  <p className="date">{formatDate(pick.fecha)}</p>
                  <h3>{pick.local} <span>vs</span> {pick.visitante}</h3>

                  <div className="selection">
                    <span>{pick.mercado}</span>
                    <strong>{pick.seleccion}</strong>
                  </div>

                  <div className="pick-metrics">
                    <div><span>Cuota</span><strong>{pick.cuota.toFixed(2)}</strong></div>
                    <div><span>Probabilidad</span><strong>{pick.probabilidad}%</strong></div>
                    <div><span>EV</span><strong className="positive">+{pick.ev.toFixed(2)}%</strong></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No hay picks activos en este momento.</p>
          )}
        </section>
      </div>

    </main>
  );
}

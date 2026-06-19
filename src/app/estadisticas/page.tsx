import type { Metadata } from "next";
import Link from "next/link";
import resultsData from "../../../public/data/public_results.json";
import StatisticsCharts from "./StatisticsCharts";

type HistoricalResult = {
  id: string | number;
  fecha: string;
  liga: string;
  local: string;
  visitante: string;
  mercado: string;
  cuota: number;
  estado: string;
};

type CalculatedResult = HistoricalResult & {
  profit: number;
  normalizedStatus: string;
};

type PerformanceRow = {
  name: string;
  total: number;
  won: number;
  lost: number;
  hitRate: number | null;
  roi: number;
};

const historicalResults = resultsData as HistoricalResult[];

export const metadata: Metadata = {
  title: "Estadísticas y rendimiento",
  description: "Analiza las estadísticas públicas de PicksProAI: ROI, porcentaje de acierto, beneficio acumulado y rendimiento por liga y mercado.",
  alternates: { canonical: "/estadisticas" },
  openGraph: {
    title: "Estadísticas y rendimiento | PicksProAI",
    description: "ROI, porcentaje de acierto, beneficio acumulado y rendimiento histórico verificable.",
    url: "/estadisticas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estadísticas y rendimiento | PicksProAI",
    description: "ROI, acierto, beneficio acumulado y rendimiento histórico verificable.",
  },
};

function normalizeStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "acertado") return "won";
  if (normalized === "fallado") return "lost";
  return normalized;
}

function profitFor(result: HistoricalResult) {
  const status = normalizeStatus(result.estado);
  if (status === "won") return result.cuota - 1;
  if (status === "lost") return -1;
  return 0;
}

function parseDate(date: string) {
  const shortDate = /^(\d{2})\.(\d{2})$/.exec(date);
  if (shortDate) return new Date(2026, Number(shortDate[2]) - 1, Number(shortDate[1]), 12);
  return new Date(date.includes("T") ? date : `${date}T12:00:00`);
}

function formatDate(date: string) {
  const parsed = parseDate(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatPercentage(value: number | null, signed = false) {
  if (value === null) return "—";
  return `${signed && value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function groupPerformance(results: CalculatedResult[], field: "liga" | "mercado"): PerformanceRow[] {
  const groups = new Map<string, CalculatedResult[]>();

  for (const result of results) {
    const current = groups.get(result[field]) ?? [];
    current.push(result);
    groups.set(result[field], current);
  }

  return Array.from(groups, ([name, group]) => {
    const won = group.filter((result) => result.normalizedStatus === "won").length;
    const lost = group.filter((result) => result.normalizedStatus === "lost").length;
    const settled = won + lost;
    const profit = group.reduce((total, result) => total + result.profit, 0);

    return {
      name,
      total: group.length,
      won,
      lost,
      hitRate: settled > 0 ? (won / settled) * 100 : null,
      roi: (profit / group.length) * 100,
    };
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es"));
}

function PerformanceTable({ rows, label }: { rows: PerformanceRow[]; label: string }) {
  return (
    <div className="results-table-wrap">
      <table className="results-table performance-table">
        <thead>
          <tr>
            <th>{label}</th>
            <th>Total picks</th>
            <th>Ganados</th>
            <th>Perdidos</th>
            <th>Acierto</th>
            <th>ROI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td data-label={label}><strong>{row.name}</strong></td>
              <td data-label="Total picks">{row.total}</td>
              <td data-label="Ganados">{row.won}</td>
              <td data-label="Perdidos">{row.lost}</td>
              <td data-label="Acierto">{formatPercentage(row.hitRate)}</td>
              <td data-label="ROI"><strong className={row.roi >= 0 ? "positive" : "negative"}>{formatPercentage(row.roi, true)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StatisticsPage() {
  const results: CalculatedResult[] = historicalResults.map((result) => ({
    ...result,
    normalizedStatus: normalizeStatus(result.estado),
    profit: profitFor(result),
  }));
  const won = results.filter((result) => result.normalizedStatus === "won").length;
  const lost = results.filter((result) => result.normalizedStatus === "lost").length;
  const settled = won + lost;
  const hitRate = settled > 0 ? (won / settled) * 100 : null;
  const netProfit = results.reduce((total, result) => total + result.profit, 0);
  const roi = results.length > 0 ? (netProfit / results.length) * 100 : null;
  const byLeague = groupPerformance(results, "liga").sort((a, b) => b.roi - a.roi);
  const byMarket = groupPerformance(results, "mercado");

  let cumulativeProfit = 0;
  const evolution = [...results]
    .sort((a, b) => parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime() || String(a.id).localeCompare(String(b.id)))
    .map((result) => {
      cumulativeProfit += result.profit;
      return { ...result, cumulativeProfit };
    });

  const metrics = [
    { label: "Total resultados", value: results.length, note: "Picks históricos" },
    { label: "Ganados", value: won, note: "Resultados positivos" },
    { label: "Perdidos", value: lost, note: "Resultados negativos" },
    { label: "Acierto", value: formatPercentage(hitRate), note: "Sobre ganados y perdidos" },
    { label: "ROI simple", value: formatPercentage(roi, true), note: "Stake fijo de 1 unidad" },
    { label: "Beneficio neto", value: `${netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)} u`, note: "Beneficio acumulado" },
  ];

  const chartEvolution = evolution.map((result) => ({
    date: new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(parseDate(result.fecha)),
    match: `${result.local} vs ${result.visitante}`,
    profit: Number(result.profit.toFixed(2)),
    cumulative: Number(result.cumulativeProfit.toFixed(2)),
  }));
  const chartMarkets = byMarket.map((market) => ({
    name: market.name,
    total: market.total,
    won: market.won,
    roi: Number(market.roi.toFixed(1)),
  }));
  const chartLeagues = byLeague.map((league) => ({
    name: league.name,
    total: league.total,
    hitRate: Number((league.hitRate ?? 0).toFixed(1)),
    roi: Number(league.roi.toFixed(1)),
  }));

  return (
    <main>
      <header className="page-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Rendimiento histórico</span>
          <h1>Estadísticas</h1>
          <p>Análisis transparente del histórico público de Picks Pro AI.</p>
          <div className="hero-actions">
            <Link className="button-link button-link--secondary" href="/resultados">Ver resultados</Link>
          </div>
        </div>
      </header>

      <div className="container results-content">
        <section aria-labelledby="statistics-summary-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Resumen</span>
              <h2 id="statistics-summary-title">Rendimiento general</h2>
            </div>
          </div>
          <div className="results-stats">
            {metrics.map((metric) => (
              <article className="stat-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.note}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="statistics-section" aria-labelledby="visual-dashboard-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Dashboard</span>
              <h2 id="visual-dashboard-title">Rendimiento visual</h2>
            </div>
            <span className="pick-count">{results.length} picks analizados</span>
          </div>
          <StatisticsCharts evolution={chartEvolution} markets={chartMarkets} leagues={chartLeagues} />
        </section>

        <section className="statistics-section" aria-labelledby="league-performance-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Competiciones</span>
              <h2 id="league-performance-title">Rendimiento por liga</h2>
            </div>
          </div>
          <PerformanceTable rows={byLeague} label="Liga" />
        </section>

        <section className="statistics-section" aria-labelledby="market-performance-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Selecciones</span>
              <h2 id="market-performance-title">Rendimiento por mercado</h2>
            </div>
          </div>
          <PerformanceTable rows={byMarket} label="Mercado" />
        </section>

        <section className="statistics-section" aria-labelledby="evolution-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Cronología</span>
              <h2 id="evolution-title">Evolución acumulada</h2>
            </div>
          </div>
          <div className="results-table-wrap">
            <table className="results-table evolution-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Partido</th>
                  <th>Beneficio</th>
                  <th>Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {evolution.map((result) => (
                  <tr key={result.id}>
                    <td data-label="Fecha">{formatDate(result.fecha)}</td>
                    <td data-label="Partido">
                      <strong>{result.local} <span className="versus">vs</span> {result.visitante}</strong>
                      <small>{result.liga} · {result.mercado}</small>
                    </td>
                    <td data-label="Beneficio"><strong className={result.profit >= 0 ? "positive" : "negative"}>{result.profit >= 0 ? "+" : ""}{result.profit.toFixed(2)} u</strong></td>
                    <td data-label="Acumulado"><strong className={result.cumulativeProfit >= 0 ? "positive" : "negative"}>{result.cumulativeProfit >= 0 ? "+" : ""}{result.cumulativeProfit.toFixed(2)} u</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer><div className="container">Picks Pro AI © 2026</div></footer>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import resultsData from "../../../public/data/public_results.json";

type Result = {
  id: string | number;
  fecha: string;
  liga: string;
  local: string;
  visitante: string;
  mercado: string;
  seleccion: string;
  cuota: number;
  estado: string;
};

type NormalizedStatus = "won" | "lost" | "push" | "void" | "canceled" | "other";

const historicalResults = resultsData as Result[];

export const metadata: Metadata = {
  title: "Resultados | Picks Pro AI",
  description: "Historial público de resultados de Picks Pro AI.",
};

const statusDetails: Record<NormalizedStatus, { label: string; className: string }> = {
  won: { label: "Ganado", className: "won" },
  lost: { label: "Perdido", className: "lost" },
  push: { label: "Push", className: "push" },
  void: { label: "Void", className: "void" },
  canceled: { label: "Cancelado", className: "canceled" },
  other: { label: "Otro", className: "other" },
};

function normalizeStatus(status: string): NormalizedStatus {
  const normalized = status.trim().toLowerCase();
  if (["won", "acertado"].includes(normalized)) return "won";
  if (["lost", "fallado"].includes(normalized)) return "lost";
  if (normalized === "push") return "push";
  if (normalized === "void") return "void";
  if (normalized === "canceled") return "canceled";
  return "other";
}

function formatDate(date: string) {
  if (/^\d{2}\.\d{2}$/.test(date)) return date;

  const parsedDate = new Date(date.includes("T") ? date : `${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function ResultsPage() {
  const results = historicalResults.map((result) => ({
    ...result,
    normalizedStatus: normalizeStatus(result.estado),
  }));
  const won = results.filter((result) => result.normalizedStatus === "won").length;
  const lost = results.filter((result) => result.normalizedStatus === "lost").length;
  const push = results.filter((result) => result.normalizedStatus === "push").length;
  const voidCount = results.filter((result) => result.normalizedStatus === "void").length;
  const canceled = results.filter((result) => result.normalizedStatus === "canceled").length;
  const settled = won + lost;
  const hitRate = settled > 0 ? (won / settled) * 100 : null;
  const netProfit = results.reduce((total, result) => {
    if (result.normalizedStatus === "won") return total + (result.cuota - 1);
    if (result.normalizedStatus === "lost") return total - 1;
    return total;
  }, 0);
  const roi = results.length > 0 ? (netProfit / results.length) * 100 : null;

  const metrics = [
    { label: "Total resultados", value: results.length, note: "Historial publicado" },
    { label: "Ganados", value: won, note: "Picks acertados" },
    { label: "Perdidos", value: lost, note: "Picks fallados" },
    { label: "Push", value: push, note: "Stake devuelto" },
    { label: "Void", value: voidCount, note: "Apuesta anulada" },
    { label: "Cancelados", value: canceled, note: "Evento cancelado" },
    { label: "Acierto", value: hitRate === null ? "—" : `${hitRate.toFixed(1)}%`, note: "Sobre ganados y perdidos" },
    { label: "ROI simple", value: roi === null ? "—" : `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`, note: "1 unidad por resultado" },
  ];

  return (
    <main>
      <header className="page-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Historial público</span>
          <h1>Resultados</h1>
          <p>Seguimiento transparente de los picks publicados por Picks Pro AI.</p>
        </div>
      </header>

      <div className="container results-content">
        <section aria-labelledby="results-summary-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Rendimiento</span>
              <h2 id="results-summary-title">Resumen de resultados</h2>
            </div>
            <span className="pick-count">{settled} resueltos</span>
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

        <section className="history-section" aria-labelledby="history-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Detalle</span>
              <h2 id="history-title">Historial de picks</h2>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="results-table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Partido</th>
                    <th>Mercado</th>
                    <th>Selección</th>
                    <th>Cuota</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const status = statusDetails[result.normalizedStatus];
                    return (
                      <tr key={result.id}>
                        <td data-label="Fecha">{formatDate(result.fecha)}</td>
                        <td data-label="Partido">
                          <strong>{result.local} <span className="versus">vs</span> {result.visitante}</strong>
                          <small>{result.liga}</small>
                        </td>
                        <td data-label="Mercado">{result.mercado}</td>
                        <td data-label="Selección"><strong>{result.seleccion}</strong></td>
                        <td data-label="Cuota"><strong>{result.cuota.toFixed(2)}</strong></td>
                        <td data-label="Estado">
                          <span className={`result-badge result-badge--${status.className}`}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">Todavía no hay resultados publicados.</p>
          )}
        </section>
      </div>

      <footer><div className="container">Picks Pro AI © 2026</div></footer>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import picksData from "../../../public/data/public_picks.json";

type Pick = {
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

type NormalizedStatus = "pending" | "won" | "lost" | "other";

const picks = picksData as Pick[];

export const metadata: Metadata = {
  title: "Resultados | Picks Pro AI",
  description: "Historial público de picks de Picks Pro AI.",
};

const statusDetails: Record<NormalizedStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "pending" },
  won: { label: "Ganado", className: "won" },
  lost: { label: "Perdido", className: "lost" },
  other: { label: "Otro", className: "other" },
};

function normalizeStatus(status: string): NormalizedStatus {
  const normalized = status.trim().toLowerCase();

  if (["pending", "pendiente", "active"].includes(normalized)) return "pending";
  if (["won", "acertado"].includes(normalized)) return "won";
  if (["lost", "fallado"].includes(normalized)) return "lost";
  return "other";
}

function formatDate(date: string) {
  const parsedDate = new Date(date.includes("T") ? date : `${date}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function ResultsPage() {
  const results = picks.map((pick) => ({ ...pick, normalizedStatus: normalizeStatus(pick.estado) }));
  const pending = results.filter((pick) => pick.normalizedStatus === "pending").length;
  const won = results.filter((pick) => pick.normalizedStatus === "won").length;
  const lost = results.filter((pick) => pick.normalizedStatus === "lost").length;
  const settled = won + lost;
  const hitRate = settled > 0 ? (won / settled) * 100 : null;
  const netProfit = results.reduce((total, pick) => {
    if (pick.normalizedStatus === "won") return total + (pick.cuota - 1);
    if (pick.normalizedStatus === "lost") return total - 1;
    return total;
  }, 0);
  const roi = settled > 0 ? (netProfit / settled) * 100 : null;

  const metrics = [
    { label: "Total de picks", value: results.length, note: "Historial publicado" },
    { label: "Pendientes", value: pending, note: "Por resolver" },
    { label: "Ganados", value: won, note: "Picks acertados" },
    { label: "Perdidos", value: lost, note: "Picks fallados" },
    { label: "Acierto", value: hitRate === null ? "—" : `${hitRate.toFixed(1)}%`, note: "Sobre picks resueltos" },
    { label: "ROI simple", value: roi === null ? "—" : `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`, note: "Stake fijo de 1 unidad" },
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
                  {results.map((pick) => {
                    const status = statusDetails[pick.normalizedStatus];
                    return (
                      <tr key={pick.id}>
                        <td data-label="Fecha">{formatDate(pick.fecha)}</td>
                        <td data-label="Partido">
                          <strong>{pick.local} <span className="versus">vs</span> {pick.visitante}</strong>
                          <small>{pick.liga}</small>
                        </td>
                        <td data-label="Mercado">{pick.mercado}</td>
                        <td data-label="Selección"><strong>{pick.seleccion}</strong></td>
                        <td data-label="Cuota"><strong>{pick.cuota.toFixed(2)}</strong></td>
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
            <p className="empty-state">Todavía no hay picks publicados.</p>
          )}
        </section>
      </div>

      <footer><div className="container">Picks Pro AI © 2026</div></footer>
    </main>
  );
}

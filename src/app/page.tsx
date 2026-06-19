import Link from "next/link";
import picksData from "../../public/data/public_picks.json";

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

const formatDate = (date: string) => {
  const parsedDate = new Date(date.includes("T") ? date : `${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    ...(date.includes("T") && { hour: "2-digit", minute: "2-digit" }),
  }).format(parsedDate);
};

export default function Home() {
  const publicPicks = picks;
  const leagueCount = new Set(publicPicks.map((pick) => pick.liga)).size;
  const averageOdds = publicPicks.length
    ? publicPicks.reduce((total, pick) => total + pick.cuota, 0) / publicPicks.length
    : 0;

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
          </div>
        </div>
      </header>

      <div className="container content">
        <section aria-labelledby="stats-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Resumen</span>
              <h2 id="stats-title">Estadísticas básicas</h2>
            </div>
            <span className="live-indicator"><i /> Datos actualizados</span>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <span>Picks activos</span>
              <strong>{publicPicks.length}</strong>
              <small>Selecciones disponibles</small>
            </article>
            <article className="stat-card">
              <span>Ligas</span>
              <strong>{leagueCount}</strong>
              <small>Competiciones analizadas</small>
            </article>
            <article className="stat-card">
              <span>Cuota media</span>
              <strong>{averageOdds.toFixed(2)}</strong>
              <small>Sobre los picks activos</small>
            </article>
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

      <footer><div className="container">Picks Pro AI © 2026</div></footer>
    </main>
  );
}

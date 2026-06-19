import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Sobre PicksProAI | Análisis Deportivo Basado en Datos" },
  description: "Conoce cómo funciona PicksProAI, qué estadísticas utiliza y cómo se generan los análisis deportivos publicados en la plataforma.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: "Sobre PicksProAI | Análisis Deportivo Basado en Datos",
    description: "Conoce cómo funciona PicksProAI, sus métricas públicas y su enfoque transparente del análisis deportivo.",
    url: "/sobre",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PicksProAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre PicksProAI | Análisis Deportivo Basado en Datos",
    description: "Análisis deportivo basado en estadísticas históricas, métricas públicas y resultados verificables.",
    images: ["/og-image.png"],
  },
};

const leagues = ["España", "Brasil Serie B", "Japón", "Suecia", "Noruega", "China"];

const publicMetrics = [
  ["% de acierto", "Proporción de picks ganados sobre los resultados decididos como ganados o perdidos."],
  ["ROI", "Rentabilidad obtenida en relación con el total de unidades utilizadas."],
  ["Beneficio acumulado", "Suma cronológica de los beneficios y pérdidas del histórico público."],
  ["Ganados y perdidos", "Recuento visible de los resultados positivos y negativos publicados."],
];

export default function AboutPage() {
  return (
    <main>
      <header className="page-hero methodology-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Datos, seguimiento y transparencia</span>
          <h1>Sobre PicksProAI</h1>
          <p>Una plataforma pública para consultar análisis deportivos y evaluar su rendimiento mediante resultados verificables.</p>
        </div>
      </header>

      <div className="container methodology-content">
        <section className="methodology-intro" aria-labelledby="about-title">
          <div>
            <span className="section-kicker">La plataforma</span>
            <h2 id="about-title">¿Qué es PicksProAI?</h2>
          </div>
          <p>PicksProAI es una plataforma de análisis deportivo basada en estadísticas históricas y resultados verificables. Su objetivo es mostrar información transparente sobre el rendimiento de distintos mercados deportivos.</p>
        </section>

        <div className="methodology-grid">
          <section className="methodology-card methodology-card--wide" aria-labelledby="about-method-title">
            <span className="methodology-card__number">01</span>
            <div>
              <span className="section-kicker">Proceso público</span>
              <h2 id="about-method-title">Metodología</h2>
              <p>Los análisis se elaboran a partir de un proceso comprensible y orientado a la evaluación continua:</p>
              <ol className="process-list">
                <li><strong>Datos históricos</strong><span>Se utilizan resultados anteriores para estudiar el comportamiento de partidos y mercados.</span></li>
                <li><strong>Evaluación estadística</strong><span>Las oportunidades se valoran mediante probabilidades y criterios cuantitativos.</span></li>
                <li><strong>Seguimiento de resultados</strong><span>Cada pick publicado se incorpora al histórico cuando su resultado queda resuelto.</span></li>
                <li><strong>Métricas verificables</strong><span>El rendimiento se presenta mediante datos públicos que se recalculan automáticamente.</span></li>
              </ol>
              <div className="methodology-note"><strong>Transparencia</strong><p>Los análisis no garantizan resultados. El histórico completo permite valorar el rendimiento sobre datos reales y no sobre selecciones aisladas.</p></div>
            </div>
          </section>

          <section className="methodology-card methodology-card--wide" aria-labelledby="public-metrics-title">
            <span className="methodology-card__number">02</span>
            <div>
              <span className="section-kicker">Rendimiento</span>
              <h2 id="public-metrics-title">Métricas públicas</h2>
              <div className="market-method-grid">
                {publicMetrics.map(([name, description]) => (
                  <article key={name}><strong>{name}</strong><p>{description}</p></article>
                ))}
              </div>
            </div>
          </section>

          <section className="methodology-card methodology-card--wide" aria-labelledby="analyzed-leagues-title">
            <span className="methodology-card__number">03</span>
            <div>
              <span className="section-kicker">Cobertura</span>
              <h2 id="analyzed-leagues-title">Ligas analizadas</h2>
              <div className="market-method-grid">
                {leagues.map((league) => (
                  <article key={league}><strong>{league}</strong><p>Resultados y métricas disponibles en el histórico público.</p></article>
                ))}
              </div>
            </div>
          </section>

          <section className="methodology-card methodology-card--wide methodology-card--accent" aria-labelledby="explore-title">
            <span className="methodology-card__number">04</span>
            <div>
              <span className="section-kicker">Explorar PicksProAI</span>
              <h2 id="explore-title">Consulta los datos públicos</h2>
              <p>Revisa el histórico, analiza las métricas generales o compara el rendimiento de cada competición.</p>
              <div className="methodology-actions">
                <Link className="button-link" href="/resultados">Ver resultados</Link>
                <Link className="button-link button-link--secondary" href="/estadisticas">Ver estadísticas</Link>
                <Link className="button-link button-link--secondary" href="/rendimiento-ligas">Rendimiento por ligas</Link>
                <Link className="button-link button-link--secondary" href="/metodologia">Metodología completa</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metodología y transparencia",
  description: "Descubre cómo PicksProAI analiza datos históricos, detecta valor esperado y calcula ROI y porcentaje de acierto con transparencia.",
  alternates: { canonical: "/metodologia" },
  openGraph: {
    title: "Metodología y transparencia | PicksProAI",
    description: "Cómo se generan los picks y cómo interpretar el ROI, el acierto y los resultados públicos.",
    url: "/metodologia",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PicksProAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Metodología y transparencia | PicksProAI",
    description: "Cómo se generan los picks y cómo interpretar sus métricas públicas.",
    images: ["/og-image.png"],
  },
};

const markets = [
  ["Over 2.5", "El partido termina con tres o más goles."],
  ["Under 2.5", "El partido termina con un máximo de dos goles."],
  ["Ambos marcan (BTTS)", "Los dos equipos anotan al menos un gol."],
  ["Mercados futuros", "Podrán incorporarse cuando exista una muestra histórica suficiente."],
];

export default function MethodologyPage() {
  return (
    <main>
      <header className="page-hero methodology-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Criterios y transparencia</span>
          <h1>Metodología</h1>
          <p>Cómo analizamos oportunidades, calculamos el rendimiento y presentamos nuestros resultados públicos.</p>
        </div>
      </header>

      <div className="container methodology-content">
        <section className="methodology-intro" aria-labelledby="what-is-title">
          <div><span className="section-kicker">El proyecto</span><h2 id="what-is-title">¿Qué es Picks Pro AI?</h2></div>
          <p>Picks Pro AI es un proyecto de análisis estadístico de fútbol basado en datos históricos. Estudia partidos y mercados con criterios cuantitativos para presentar de forma comprensible las oportunidades detectadas y su rendimiento posterior.</p>
        </section>

        <div className="methodology-grid">
          <section className="methodology-card methodology-card--wide" aria-labelledby="generation-title">
            <span className="methodology-card__number">01</span>
            <div>
              <span className="section-kicker">Proceso</span><h2 id="generation-title">¿Cómo se generan los picks?</h2>
              <p>El proceso combina varias capas de análisis antes de publicar una selección:</p>
              <ol className="process-list">
                <li><strong>Análisis histórico</strong><span>Se estudian patrones y resultados anteriores relevantes.</span></li>
                <li><strong>Evaluación de probabilidades</strong><span>Se estima la probabilidad de cada escenario con criterios estadísticos.</span></li>
                <li><strong>Detección de valor</strong><span>La probabilidad estimada se compara con la implícita en la cuota.</span></li>
                <li><strong>Selección</strong><span>Se publican oportunidades con valor esperado positivo que superan los filtros.</span></li>
              </ol>
              <div className="methodology-note"><strong>Importante</strong><p>Ningún análisis elimina la incertidumbre ni garantiza resultados. Una apuesta con valor puede perder y la metodología debe evaluarse sobre una muestra amplia.</p></div>
            </div>
          </section>

          <section className="methodology-card methodology-card--wide" aria-labelledby="markets-title">
            <span className="methodology-card__number">02</span>
            <div>
              <span className="section-kicker">Cobertura</span><h2 id="markets-title">Mercados analizados</h2>
              <div className="market-method-grid">
                {markets.map(([name, description]) => <article key={name}><strong>{name}</strong><p>{description}</p></article>)}
              </div>
            </div>
          </section>

          <section className="methodology-card" aria-labelledby="roi-title">
            <span className="methodology-card__number">03</span>
            <div>
              <span className="section-kicker">Rentabilidad</span><h2 id="roi-title">¿Qué es el ROI?</h2>
              <p>El retorno sobre la inversión indica el beneficio o pérdida en relación con el total apostado.</p>
              <div className="formula-box"><span>ROI</span><strong>beneficio neto ÷ unidades apostadas × 100</strong></div>
              <p><strong>Ejemplo:</strong> si se apuestan 10 unidades y el beneficio neto es 1,5, el ROI es del <strong>+15 %</strong>.</p>
            </div>
          </section>

          <section className="methodology-card" aria-labelledby="hit-rate-title">
            <span className="methodology-card__number">04</span>
            <div>
              <span className="section-kicker">Precisión</span><h2 id="hit-rate-title">¿Qué es el porcentaje de acierto?</h2>
              <p>Es la proporción de picks ganados sobre los picks resueltos como ganados o perdidos.</p>
              <div className="formula-box"><span>Acierto</span><strong>ganados ÷ (ganados + perdidos) × 100</strong></div>
              <p>Acierto y rentabilidad no son equivalentes: una estrategia puede acertar menos y ser rentable si sus cuotas compensan las pérdidas.</p>
            </div>
          </section>

          <section className="methodology-card methodology-card--accent" aria-labelledby="transparency-title">
            <span className="methodology-card__number">05</span>
            <div>
              <span className="section-kicker">Compromiso</span><h2 id="transparency-title">Política de transparencia</h2>
              <ul className="principles-list">
                <li>Todos los resultados publicados permanecen visibles.</li><li>Los picks perdidos no se eliminan del histórico.</li><li>Las estadísticas se calculan automáticamente desde los resultados públicos.</li><li>Los estados neutrales no cuentan como victorias ni derrotas.</li>
              </ul>
              <Link className="inline-link" href="/resultados">Consultar el historial público →</Link>
            </div>
          </section>

          <section className="methodology-card methodology-card--warning" aria-labelledby="responsible-title">
            <span className="methodology-card__number">06</span>
            <div>
              <span className="section-kicker">Responsabilidad</span><h2 id="responsible-title">Juego responsable</h2>
              <ul className="principles-list">
                <li>Apuesta solo cantidades cuya pérdida puedas asumir.</li><li>No consideres las apuestas una fuente de ingresos.</li><li>Evita perseguir pérdidas o aumentar el stake por impulso.</li><li>Esta web tiene un propósito exclusivamente informativo.</li>
              </ul>
            </div>
          </section>

          <section className="methodology-card methodology-card--wide" aria-labelledby="updates-title">
            <span className="methodology-card__number">07</span>
            <div>
              <span className="section-kicker">Datos públicos</span><h2 id="updates-title">Actualización de estadísticas</h2>
              <p>Las estadísticas visibles se calculan automáticamente a partir de nuestro histórico público de resultados. Cada vez que se publica un nuevo resultado, todas las métricas se actualizan y recalculan de forma transparente.</p>
              <p>No se eliminan resultados históricos ni picks perdidos.</p>
              <div className="methodology-actions"><Link className="button-link" href="/resultados">Ver resultados</Link><Link className="button-link button-link--secondary" href="/estadisticas">Ver estadísticas</Link></div>
            </div>
          </section>
        </div>
      </div>

    </main>
  );
}

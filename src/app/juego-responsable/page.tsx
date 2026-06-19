import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Juego responsable",
  description: "Principios de juego responsable, prevención de riesgos y uso adecuado de la información publicada por PicksProAI.",
  alternates: { canonical: "/juego-responsable" },
  openGraph: {
    title: "Juego responsable | PicksProAI",
    description: "Información para comprender los riesgos de las apuestas y mantener hábitos responsables.",
    url: "/juego-responsable",
  },
  twitter: {
    card: "summary",
    title: "Juego responsable | PicksProAI",
    description: "Principios para un uso responsable de la información sobre apuestas deportivas.",
  },
};

const principles = [
  ["Las apuestas implican riesgo", "No existe una apuesta segura. Incluso una selección bien analizada puede perder y el capital apostado puede desaparecer por completo."],
  ["Apuesta solo dinero que puedas perder", "Define un presupuesto independiente de tus gastos esenciales y nunca utilices dinero destinado a vivienda, alimentación, deudas o ahorro."],
  ["No es una fuente de ingresos", "Las apuestas no deben considerarse un salario, una inversión garantizada ni una solución a dificultades económicas."],
  ["Mantén el control emocional", "No persigas pérdidas, no aumentes el stake por frustración y evita apostar bajo estrés, enfado, alcohol u otras sustancias."],
  ["Solo para mayores de 18 años", "El contenido está dirigido a personas adultas. Además, cada usuario debe respetar la edad mínima y las normas aplicables en su jurisdicción."],
  ["Usa la información con criterio", "Los picks y estadísticas son información general. Decide de forma independiente, establece límites y acepta que las estimaciones no garantizan resultados."],
];

export default function ResponsibleGamingPage() {
  return (
    <main>
      <header className="page-hero responsible-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Información preventiva</span>
          <h1>Juego responsable</h1>
          <p>Las estadísticas ayudan a interpretar datos; nunca eliminan el riesgo inherente a las apuestas.</p>
        </div>
      </header>

      <div className="container responsible-content">
        <section className="responsible-intro">
          <span className="responsible-age">+18</span>
          <div><span className="section-kicker">Antes de apostar</span><h2>Proteger tu bienestar es lo primero</h2><p>Apostar debe ser una actividad ocasional y controlada. Si deja de ser entretenida, afecta a tus relaciones o genera preocupación económica, es momento de detenerse y pedir ayuda.</p></div>
        </section>

        <div className="responsible-grid">
          {principles.map(([title, description], index) => (
            <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{description}</p></article>
          ))}
        </div>

        <section className="help-panel" aria-labelledby="help-title">
          <div><span className="section-kicker">Recursos de ayuda</span><h2 id="help-title">Pedir ayuda es una decisión responsable</h2></div>
          <div>
            <p>Si notas pérdida de control, impulsos difíciles de gestionar, ocultación de apuestas o problemas económicos, deja de apostar y busca apoyo cuanto antes.</p>
            <ul>
              <li>Habla con una persona de confianza.</li>
              <li>Contacta con profesionales sanitarios o servicios públicos especializados en adicciones.</li>
              <li>Consulta entidades acreditadas de apoyo al juego problemático de tu país.</li>
              <li>Utiliza las herramientas de límites, pausa o autoexclusión disponibles en los operadores autorizados.</li>
            </ul>
          </div>
        </section>

        <div className="responsible-actions"><Link className="button-link button-link--secondary" href="/metodologia">Consultar metodología</Link><Link className="inline-link" href="/legal">Leer aviso legal →</Link></div>
      </div>
    </main>
  );
}

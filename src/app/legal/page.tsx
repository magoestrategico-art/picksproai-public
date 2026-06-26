import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Aviso legal, condiciones de uso y limitación de responsabilidad del sitio público PicksProAI.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Aviso legal | PicksProAI",
    description: "Naturaleza informativa, condiciones de uso y limitación de responsabilidad de PicksProAI.",
    url: "/legal",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PicksProAI" }],
  },
  twitter: {
    card: "summary",
    title: "Aviso legal | PicksProAI",
    description: "Naturaleza informativa y condiciones de uso de PicksProAI.",
    images: ["/og-image.png"],
  },
};

export default function LegalPage() {
  return (
    <main>
      <header className="page-hero legal-hero">
        <div className="hero__glow" />
        <div className="container page-hero__content">
          <Link className="back-link" href="/">← Volver al inicio</Link>
          <span className="eyebrow"><i /> Información del sitio</span>
          <h1>Aviso legal</h1>
          <p>Condiciones generales para el acceso y uso de la información publicada por PicksProAI.</p>
        </div>
      </header>

      <article className="container legal-content">
        <p className="legal-updated">Última actualización: 19 de junio de 2026</p>

        <section><span>01</span><div><h2>Identificación del sitio web</h2><p>Este sitio web opera bajo la denominación PicksProAI y es accesible públicamente mediante el dominio picksproai.com. Su contenido está dedicado al análisis estadístico de fútbol y a la publicación de picks, resultados históricos y métricas de rendimiento.</p></div></section>

        <section><span>02</span><div><h2>Naturaleza informativa del servicio</h2><p>La información publicada tiene una finalidad exclusivamente informativa y divulgativa. PicksProAI no actúa como casa de apuestas, intermediario financiero, asesor de inversiones ni operador de juego. El contenido no constituye una recomendación personalizada para apostar.</p></div></section>

        <section><span>03</span><div><h2>Exclusión de responsabilidad</h2><p>Los análisis se elaboran a partir de datos históricos, estimaciones probabilísticas y criterios estadísticos. Aunque se procura ofrecer información clara y correcta, pueden existir errores, retrasos, datos incompletos o cambios posteriores en partidos, cuotas y mercados.</p></div></section>

        <section><span>04</span><div><h2>No garantía de beneficios</h2><p>Los resultados pasados no garantizan resultados futuros. Ningún pick, probabilidad, valor esperado, porcentaje de acierto o ROI publicado implica una garantía de éxito o rentabilidad. Toda apuesta puede resultar perdedora.</p></div></section>

        <section><span>05</span><div><h2>Limitación de responsabilidad</h2><p>En la medida permitida por la normativa aplicable, PicksProAI no será responsable de pérdidas económicas, daños o decisiones adoptadas a partir del contenido del sitio. El usuario debe verificar por sí mismo la información antes de realizar cualquier acción.</p></div></section>

        <section><span>06</span><div><h2>Uso bajo responsabilidad del usuario</h2><p>El acceso y uso del sitio se realiza bajo la responsabilidad del usuario. Al utilizar esta web, el usuario reconoce que comprende los riesgos asociados a las apuestas y que debe cumplir la legislación y los límites de edad aplicables en su lugar de residencia.</p></div></section>

        <section><span>07</span><div><h2>Contacto oficial</h2><p>El medio oficial de contacto de PicksProAI es <a className="inline-link" href="mailto:picksproai@gmail.com">picksproai@gmail.com</a>.</p></div></section>

        <aside className="legal-callout"><strong>Uso responsable</strong><p>Si decides apostar, utiliza únicamente cantidades cuya pérdida puedas asumir y consulta nuestra página de <Link href="/juego-responsable">Juego Responsable</Link>.</p></aside>
      </article>
    </main>
  );
}

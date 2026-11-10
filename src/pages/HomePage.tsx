import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Logo } from "../components/Logo";

const features = [
  {
    icon: "◈",
    title: "Streaming Académico Seguro",
    text: "Contenido institucional disponible para tu comunidad, desde cualquier dispositivo.",
  },
  {
    icon: "✦",
    title: "Apuntes y Marcadores por Timestamp",
    text: "Guarda tus ideas justo en el momento de la clase y repasa con intención.",
  },
  {
    icon: "◎",
    title: "Gestión para Profesores",
    text: "Comparte conocimiento, administra tus cursos y acompaña el aprendizaje.",
  },
];

export function HomePage() {
  return (
    <div className="home-page">
      <Navbar />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> APRENDIZAJE A TU RITMO
            </div>
            <h1>
              Donde el aprendizaje se <em>comparte</em>
            </h1>
            <p className="hero-text">
              Aprende, comparte y vuelve a tus clases cuando quieras. Todo el
              conocimiento de tu comunidad académica en un solo lugar.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#catalog">
                Explorar Cursos <span aria-hidden="true">→</span>
              </a>
              <Link className="button button-secondary" to="/register">
                Comenzar como Alumno
              </Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>AL</span>
                <span>MR</span>
                <span>JS</span>
              </div>
              <span>+2,000 estudiantes aprendiendo</span>
            </div>
          </div>
          <div
            className="video-preview"
            aria-label="Vista previa del curso Introducción al Diseño"
          >
            <div className="video-glow" />
            <div className="video-card">
              <div className="video-top">
                <span className="live-tag">● EN VIVO</span>
                <span>⋯</span>
              </div>
              <div className="video-scene">
                <div className="scene-shape scene-one" />
                <div className="scene-shape scene-two" />
                <div className="play-button">▶</div>
                <span className="scene-label">INTRODUCCIÓN AL DISEÑO</span>
              </div>
              <div className="video-info">
                <div>
                  <p>Principios de diseño</p>
                  <small>Arq. Sofía Ramírez · Diseño</small>
                </div>
                <span className="video-time">12:48</span>
              </div>
              <div className="progress">
                <span />
              </div>
            </div>
            <div className="floating-note">
              <span className="note-icon">✎</span>
              <div>
                <strong>Tu apunte guardado</strong>
                <small>03:42 · “La forma sigue a la función”</small>
              </div>
            </div>
          </div>
        </section>

        <section className="features section container" id="features">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TODO LO QUE NECESITAS</div>
              <h2>
                Aprender debe sentirse <em>simple.</em>
              </h2>
            </div>
            <p>
              Diseñamos cada herramienta pensando en tu experiencia dentro y
              fuera del aula.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <span className="card-arrow">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog section container" id="catalog">
          <div className="catalog-heading">
            <div>
              <div className="eyebrow">CATÁLOGO DEMO</div>
              <h2>Explora nuevas ideas</h2>
            </div>
            <a className="text-link" href="#catalog">
              Ver todo el catálogo <span>→</span>
            </a>
          </div>
          <div className="course-grid">
            <article className="course-card course-purple">
              <span>DISEÑO</span>
              <h3>
                Introducción al
                <br />
                Diseño
              </h3>
              <small>12 clases · 4.8 ★</small>
            </article>
            <article className="course-card course-orange">
              <span>NEGOCIOS</span>
              <h3>
                Ideas que
                <br />
                transforman
              </h3>
              <small>8 clases · 4.9 ★</small>
            </article>
            <article className="course-card course-blue">
              <span>TECNOLOGÍA</span>
              <h3>
                El futuro es
                <br />
                ahora
              </h3>
              <small>16 clases · 4.7 ★</small>
            </article>
          </div>
        </section>

        <section className="cta container" id="teachers">
          <div>
            <div className="eyebrow">PARA TODA LA COMUNIDAD</div>
            <h2>
              El conocimiento no
              <br />
              <em>tiene límites.</em>
            </h2>
            <p>
              Únete con tu correo institucional y empieza a aprender a tu ritmo.
            </p>
          </div>
          <Link className="button button-light" to="/register">
            Crear mi cuenta <span>→</span>
          </Link>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-content">
          <Logo />
          <div className="footer-links">
            <a href="#features">Características</a>
            <a href="#catalog">Catálogo</a>
            <a href="#teachers">Docentes</a>
            <Link to="/login">Acceder</Link>
          </div>
          <span>© 2026 EduStream</span>
        </div>
      </footer>
    </div>
  );
}

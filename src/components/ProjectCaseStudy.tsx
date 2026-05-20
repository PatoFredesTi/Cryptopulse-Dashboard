import { Award, CheckCircle2, Cloud, Code2, Database, GitBranch, Rocket, ShieldCheck, Sparkles, TestTube2 } from 'lucide-react';

const content = {
  es: {
    eyebrow: 'Release profesional · v3.0',
    title: 'CryptoPulse como caso de estudio para portafolio',
    subtitle: 'Una evolución desde una tabla de criptomonedas hacia un dashboard full product: análisis de mercado, detalles por activo, auth UI, watchlists, simulador de portafolio, alertas y arquitectura cloud-ready.',
    repo: 'Ver código',
    demo: 'Demo en Vercel',
    problemTitle: 'Problema',
    problem: 'Una tabla de precios cripto es útil, pero no demuestra suficiente criterio de producto, arquitectura ni experiencia de usuario. La v3.0 empaqueta la app como una herramienta de análisis que un reclutador puede entender y evaluar rápidamente.',
    solutionTitle: 'Solución',
    solution: 'CryptoPulse centraliza datos de mercado, visualizaciones, seguimiento personalizado y módulos privados simulados, dejando una base preparada para persistencia cloud con AWS.',
    impactTitle: 'Qué demuestra',
    architectureTitle: 'Arquitectura objetivo',
    qualityTitle: 'Checklist de calidad',
    decisionsTitle: 'Decisiones técnicas defendibles',
    nextTitle: 'Siguiente salto después de v3.0',
    stackTitle: 'Stack principal',
    metrics: [
      ['10 versiones', 'Roadmap incremental desde v2.0 a v3.0'],
      ['100 activos', 'Mercado cripto, filtros y visualización'],
      ['5 módulos privados', 'Auth, watchlists, portfolio, alertas y cloud sync'],
      ['Cloud-ready', 'Preparado para Cognito, Lambda, DynamoDB y EventBridge'],
    ],
    impact: [
      'Frontend moderno con React, Vite y TypeScript.',
      'Visualización de datos con gráficos de precio, volumen, comparación y distribución.',
      'Modelado de dominio: watchlists, transacciones, posiciones, alertas y sync cloud.',
      'UX de producto: skeletons, empty states, error states, toasts y responsive design.',
      'Arquitectura preparada para backend serverless en AWS.'
    ],
    architecture: [
      ['Frontend', 'React + Vite + TypeScript desplegado en Vercel.'],
      ['Data source', 'CoinGecko API para mercado, tendencias y gráficos históricos.'],
      ['Local product layer', 'localStorage tipado para sesión demo, watchlists, portafolio y alertas.'],
      ['Cloud target', 'Cognito + API Gateway + Lambda + DynamoDB + EventBridge.'],
    ],
    quality: [
      'TypeScript typecheck integrado al build.',
      'Tests unitarios base para utilidades de formato y analytics.',
      'GitHub Actions CI para typecheck, tests y build.',
      'Metadata SEO/Open Graph para demo pública.',
      'Documentación de arquitectura, caso de estudio y roadmap.'
    ],
    decisions: [
      ['Vite sobre CRA', 'Reduce deuda técnica y mejora la experiencia de desarrollo.'],
      ['TypeScript', 'Aumenta mantenibilidad y reduce errores al crecer el dominio.'],
      ['Local-first demo', 'Permite mostrar producto completo sin depender de credenciales cloud.'],
      ['Cloud adapter', 'Separa la UI de la futura API real para migrar gradualmente.'],
    ],
    next: [
      'Implementar autenticación real con AWS Cognito.',
      'Persistir watchlists, portfolio y alertas en DynamoDB.',
      'Evaluar alertas con EventBridge + Lambda.',
      'Agregar tests de componentes con Testing Library.',
    ],
  },
  en: {
    eyebrow: 'Professional release · v3.0',
    title: 'CryptoPulse as a portfolio case study',
    subtitle: 'An evolution from a crypto table into a full product dashboard: market analytics, asset details, auth UI, watchlists, portfolio simulator, alerts and cloud-ready architecture.',
    repo: 'View code',
    demo: 'Vercel demo',
    problemTitle: 'Problem',
    problem: 'A crypto price table is useful, but it does not show enough product thinking, architecture or user experience. v3.0 packages the app as an analytics tool recruiters can understand and evaluate quickly.',
    solutionTitle: 'Solution',
    solution: 'CryptoPulse centralizes market data, visualizations, personalized tracking and simulated private modules, with a foundation prepared for AWS cloud persistence.',
    impactTitle: 'What it demonstrates',
    architectureTitle: 'Target architecture',
    qualityTitle: 'Quality checklist',
    decisionsTitle: 'Defensible technical decisions',
    nextTitle: 'Next step after v3.0',
    stackTitle: 'Core stack',
    metrics: [
      ['10 versions', 'Incremental roadmap from v2.0 to v3.0'],
      ['100 assets', 'Crypto market, filters and visualization'],
      ['5 private modules', 'Auth, watchlists, portfolio, alerts and cloud sync'],
      ['Cloud-ready', 'Prepared for Cognito, Lambda, DynamoDB and EventBridge'],
    ],
    impact: [
      'Modern frontend with React, Vite and TypeScript.',
      'Data visualization with price, volume, comparison and allocation charts.',
      'Domain modeling: watchlists, transactions, positions, alerts and cloud sync.',
      'Product UX: skeletons, empty states, error states, toasts and responsive design.',
      'Architecture prepared for an AWS serverless backend.'
    ],
    architecture: [
      ['Frontend', 'React + Vite + TypeScript deployed on Vercel.'],
      ['Data source', 'CoinGecko API for market data, trends and historical charts.'],
      ['Local product layer', 'Typed localStorage for demo session, watchlists, portfolio and alerts.'],
      ['Cloud target', 'Cognito + API Gateway + Lambda + DynamoDB + EventBridge.'],
    ],
    quality: [
      'TypeScript typecheck integrated into the build.',
      'Base unit tests for formatting and analytics utilities.',
      'GitHub Actions CI for typecheck, tests and build.',
      'SEO/Open Graph metadata for the public demo.',
      'Architecture, case study and roadmap documentation.'
    ],
    decisions: [
      ['Vite over CRA', 'Reduces technical debt and improves the developer experience.'],
      ['TypeScript', 'Improves maintainability and reduces errors as the domain grows.'],
      ['Local-first demo', 'Shows a complete product without relying on cloud credentials.'],
      ['Cloud adapter', 'Separates the UI from the future real API for gradual migration.'],
    ],
    next: [
      'Implement real authentication with AWS Cognito.',
      'Persist watchlists, portfolio and alerts in DynamoDB.',
      'Evaluate alerts with EventBridge + Lambda.',
      'Add component tests with Testing Library.',
    ],
  },
};

type ProjectCaseStudyProps = {
  locale: string;
};

const stack = ['React 18', 'Vite', 'TypeScript', 'Recharts', 'CoinGecko API', 'Vercel', 'AWS-ready'];
const icons = [Rocket, Code2, Database, Cloud];

export function ProjectCaseStudy({ locale }: ProjectCaseStudyProps) {
  const copy = locale === 'en' ? content.en : content.es;

  return (
    <section className="case-study-page">
      <div className="case-hero panel">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
          <div className="case-actions">
            <a className="primary-button" href="https://github.com/PatoFredesTi/AplicacionTablaCriptomonedas" target="_blank" rel="noreferrer">
              <GitBranch size={16} />
              {copy.repo}
            </a>
            <a className="secondary-button" href="https://vercel.com/new" target="_blank" rel="noreferrer">
              <Rocket size={16} />
              {copy.demo}
            </a>
          </div>
        </div>
        <div className="release-badge">
          <Award size={36} />
          <strong>v3.0</strong>
          <span>Portfolio Release</span>
        </div>
      </div>

      <div className="case-metrics-grid">
        {copy.metrics.map(([value, label], index) => {
          const Icon = icons[index] ?? Sparkles;
          return (
            <article className="panel case-metric" key={value}>
              <Icon size={20} />
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          );
        })}
      </div>

      <div className="case-two-column">
        <article className="panel case-card">
          <p className="eyebrow">01</p>
          <h3>{copy.problemTitle}</h3>
          <p>{copy.problem}</p>
        </article>
        <article className="panel case-card">
          <p className="eyebrow">02</p>
          <h3>{copy.solutionTitle}</h3>
          <p>{copy.solution}</p>
        </article>
      </div>

      <div className="case-content-grid">
        <article className="panel case-card">
          <div className="case-card-title">
            <Sparkles size={18} />
            <h3>{copy.impactTitle}</h3>
          </div>
          <ul className="case-list">
            {copy.impact.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="panel case-card">
          <div className="case-card-title">
            <Cloud size={18} />
            <h3>{copy.architectureTitle}</h3>
          </div>
          <div className="architecture-flow">
            {copy.architecture.map(([title, description]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel case-card">
          <div className="case-card-title">
            <TestTube2 size={18} />
            <h3>{copy.qualityTitle}</h3>
          </div>
          <ul className="case-list checked">
            {copy.quality.map((item) => (
              <li key={item}>
                <CheckCircle2 size={15} />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel case-card">
          <div className="case-card-title">
            <ShieldCheck size={18} />
            <h3>{copy.decisionsTitle}</h3>
          </div>
          <div className="decision-list">
            {copy.decisions.map(([title, description]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="panel case-card">
        <div className="case-card-title">
          <Rocket size={18} />
          <h3>{copy.nextTitle}</h3>
        </div>
        <div className="next-step-grid">
          {copy.next.map((item) => <span key={item}>{item}</span>)}
        </div>
      </article>

      <section className="panel stack-strip">
        <strong>{copy.stackTitle}</strong>
        <div>
          {stack.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
    </section>
  );
}

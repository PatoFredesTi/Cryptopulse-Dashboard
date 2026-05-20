import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type AppErrorBoundaryProps = {
  locale?: 'es' | 'en' | string;
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error?.message ?? 'Unexpected application error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CryptoPulse UI error:', error, info);
  }

  render() {
    const { locale = 'es', children } = this.props;

    if (!this.state.hasError) return children;

    const isEs = locale === 'es';

    return (
      <main className="app-shell">
        <section className="state-card error-state">
          <AlertTriangle size={34} />
          <h2>{isEs ? 'La interfaz encontró un problema' : 'The interface found a problem'}</h2>
          <p>{this.state.message}</p>
          <button className="primary-button" type="button" onClick={() => window.location.reload()}>
            {isEs ? 'Recargar aplicación' : 'Reload app'}
          </button>
        </section>
      </main>
    );
  }
}

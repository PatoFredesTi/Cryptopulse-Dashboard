import { Loader2 } from 'lucide-react';

export function LoadingState({ message }) {
  return (
    <section className="state-card">
      <Loader2 className="spin" size={32} />
      <h2>{message}</h2>
      <p>Conectando con CoinGecko y preparando el dashboard...</p>
    </section>
  );
}

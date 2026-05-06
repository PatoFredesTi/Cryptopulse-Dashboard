# CryptoPulse Dashboard v2.0

CryptoPulse es una evolución profesional del proyecto original **Aplicación Tabla Criptomonedas**. La versión 2.0 transforma una tabla de criptomonedas en un dashboard moderno de análisis de mercado, con métricas globales, tendencias, filtros avanzados, favoritos persistentes y una vista detalle por activo con gráfico histórico.

## Objetivo de la v2.0

La idea principal de esta versión es que el proyecto deje de sentirse como un ejercicio simple de consumo de API y se presente como una aplicación real de producto financiero.

Esta versión está pensada para portafolio y reclutadores: muestra consumo de API externa, visualización de datos, manejo de estado, diseño responsive, persistencia local, experiencia de usuario y estructura preparada para crecer hacia autenticación, portafolio simulado y alertas.

## Features incluidas

- Dashboard principal con identidad visual CryptoPulse.
- Cards de resumen de mercado global.
- Capitalización total, volumen 24h, dominancia BTC y criptos activas.
- Top gainer y top loser calculados desde el mercado actual.
- Tabla Top 100 con ordenamiento por ranking, precio, variaciones, market cap y volumen.
- Filtros por todas, ganadoras, perdedoras y favoritas.
- Búsqueda por nombre, símbolo o id.
- Favoritos persistentes con `localStorage`.
- Mini gráficos tipo sparkline por criptomoneda.
- Sección de criptomonedas en tendencia.
- Vista detalle al hacer click en una criptomoneda.
- Gráfico histórico por rango: 24h, 7d, 30d, 90d y 1y.
- Métricas clave por activo: market cap, volumen, supply, ATH y ATL.
- Descripción y links oficiales del proyecto cuando la API los entrega.
- Selector de moneda: USD, EUR y CLP.
- Selector de idioma: español e inglés.
- Modo claro / oscuro.
- Responsive design.
- Roadmap visible para explicar evolución del producto.

## Stack

- React
- Vite
- Recharts
- Lucide React
- CSS moderno con variables y diseño responsive
- CoinGecko API

## Instalación

```bash
npm install
npm run dev
```

Luego abre:

```bash
http://localhost:5173
```

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```txt
src/
  api/
    coingecko.js
  components/
    CoinDetailDrawer.jsx
    CryptoTable.jsx
    ErrorState.jsx
    FiltersBar.jsx
    Header.jsx
    LoadingState.jsx
    MarketOverview.jsx
    MetricCard.jsx
    RoadmapCards.jsx
    Sparkline.jsx
    TrendingCoins.jsx
  hooks/
    useCoinDetails.js
    useCryptoMarket.js
    useLocalStorage.js
  utils/
    formatters.js
    i18n.js
  App.jsx
  main.jsx
  styles.css
```

## API usada

Esta versión utiliza endpoints públicos de CoinGecko:

- `/coins/markets`
- `/global`
- `/search/trending`
- `/coins/{id}`
- `/coins/{id}/market_chart`

> Nota: la API pública de CoinGecko puede aplicar rate limits. La app incluye estados de error para manejar este caso.

## Diferencia frente a la versión anterior

La versión anterior era principalmente una tabla interactiva. La v2.0 convierte el proyecto en una experiencia tipo dashboard con una propuesta de producto más clara, mejor presentación visual y una base más sólida para seguir creciendo hacia una app full stack.

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

## Roadmap sugerido después de v2.0

### v2.1 — Página detalle con routing

- Agregar React Router o migrar a Next.js.
- Crear rutas reales como `/crypto/bitcoin`.
- Permitir compartir links directos a cada activo.

### v2.2 — TypeScript

- Migrar componentes, hooks y servicios a TypeScript.
- Tipar respuestas de CoinGecko.
- Tipar entidades como `CryptoMarket`, `CoinDetail`, `WatchlistItem` y `PortfolioTransaction`.

### v2.3 — UX avanzada

- Skeleton loaders.
- Toast notifications.
- Mejor manejo de errores.
- Paginación o infinite scroll.
- Tests de componentes principales.

### v2.5 — Auth + usuarios

- Agregar login/register.
- Opción rápida: Supabase Auth.
- Opción orientada a AWS: Cognito + API Gateway + Lambda + DynamoDB.

### v2.6 — Watchlist persistente en cloud

- Guardar favoritos por usuario.
- Crear múltiples listas.
- Agregar notas por criptomoneda.

### v2.7 — Portfolio Simulator

- Registrar compras ficticias.
- Calcular ganancia/pérdida.
- Mostrar distribución del portafolio.
- Agregar historial de transacciones.

### v2.8 — Alertas de precio

- Crear alertas por precio mayor/menor que X.
- Crear alertas por variación porcentual.
- Guardar alertas por usuario.

### v2.9 — Backend AWS

- Cognito para auth.
- API Gateway para endpoints propios.
- Lambda para lógica backend.
- DynamoDB para usuarios, watchlists, portafolios y alertas.
- EventBridge para revisar alertas programadas.

### v3.0 — Proyecto listo para reclutadores

- Demo online.
- Screenshots en README.
- Diagrama de arquitectura.
- Tests.
- CI/CD con GitHub Actions.
- Deploy S3 + CloudFront o Next.js en infraestructura AWS.

## Cómo presentarlo en el portafolio

**Nombre:** CryptoPulse Dashboard  
**Descripción corta:** Dashboard moderno para analizar el mercado cripto, visualizar gráficos históricos, guardar favoritos y preparar funcionalidades de portafolio y alertas.  
**Problema:** una tabla simple no permite entender rápidamente el estado del mercado ni analizar activos individuales.  
**Solución:** una experiencia visual e interactiva con resumen de mercado, filtros, gráficos y detalle por criptomoneda.  
**Rol:** desarrollo frontend, integración API, diseño UI/UX, arquitectura base y roadmap de producto.

## Diferencia frente a la versión anterior

La versión anterior era principalmente una tabla interactiva. La v2.0 convierte el proyecto en una experiencia tipo dashboard con una propuesta de producto más clara, mejor presentación visual y una base más sólida para seguir creciendo hacia una app full stack.

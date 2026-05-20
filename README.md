# CryptoPulse Dashboard v3.1

CryptoPulse is a professional crypto market intelligence dashboard built with **React 18, Vite, TypeScript and Recharts**. It evolves the original **CryptoTable** project into a polished product-style analytics platform with market overview cards, advanced filtering, detailed asset analysis, historical charts, a no-login local workspace, Watchlist Pro, Portfolio Simulator, Price Alerts and an AWS-ready integration layer.

> **v3.1 focus:** major UI/UX polish, a stronger first impression, cleaner navigation, a new market intelligence hero and no-login workspace access for portfolio demos.

## Live Demo

Add your Vercel URL here after deployment:

```txt
https://cryptopulse-dashboard.vercel.app
```

## Why this project matters

CryptoPulse is designed to demonstrate more than API consumption. It shows product thinking, data visualization, UI states, typed domain modeling, local persistence, modular architecture and a clear path toward serverless cloud persistence.

## Main features

- Market dashboard using CoinGecko public API.
- Top 100 crypto assets by market cap.
- Global market overview cards.
- Dashboard analytics widgets.
- Market sentiment and market pulse chart.
- Top gainers and losers.
- Market dominance panel.
- Rank segment distribution.
- Liquidity leaders.
- Trending coins panel.
- Debounced search and filters.
- Paginated crypto table.
- Favorite coins persisted in localStorage.
- Toast feedback for user actions.
- Currency selector: USD, EUR and CLP.
- Light/dark theme.
- Spanish and English copy.
- Sparkline charts in the market table.
- Detailed asset drawer with tabs.
- Price history chart.
- Volume chart.
- Performance comparison chart.
- Production-style loading, empty and error states.
- TypeScript domain types for market, auth, watchlists, portfolio, alerts and backend sync.
- No-login local workspace for recruiter-friendly demos.
- Watchlist, portfolio and alerts modules available without authentication friction.
- Auth/session code remains internally available for future cloud authentication.
- Local workspace activity timeline.
- Watchlist Pro with multiple custom lists.
- Per-asset notes, priorities, statuses and target prices.
- Portfolio Simulator with buys, sells, PnL, ROI and allocation charts.
- Price Alerts with typed local rules, trigger history and progress tracking.
- Backend-ready mock/API adapter for future AWS integration.
- Public case study page for recruiters.
- SEO/Open Graph metadata and web manifest.
- GitHub Actions CI workflow.
- Unit tests with Vitest.

## Tech stack

- React 18
- Vite
- TypeScript
- Recharts
- Lucide React
- Vitest
- CoinGecko API
- CSS custom properties
- localStorage
- Vercel-ready deployment config
- AWS-ready architecture target

## Project structure

```txt
src/
  api/
    backend.ts
    coingecko.ts
  components/
    auth/
    user/
    ProjectCaseStudy.tsx
    *.tsx
  hooks/
    useAuthSession.ts
    useCloudSync.ts
    usePortfolio.ts
    usePriceAlerts.ts
    useWatchlists.ts
    *.ts
  types/
    alerts.ts
    auth.ts
    backend.ts
    crypto.ts
    portfolio.ts
    watchlist.ts
  utils/
    __tests__/
    *.ts
  App.tsx
  main.tsx
.github/workflows/ci.yml
ARCHITECTURE.md
PORTFOLIO_CASE_STUDY.md
VERSION_3_0_NOTES.md
vercel.json
```

## Getting started

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Quality commands

```bash
npm run typecheck
npm run test:run
npm run build
npm run quality
```

## Vercel deployment

Recommended settings:

```txt
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

This package also includes `vercel.json` with SPA rewrites and cache headers for built assets.

## Auth and persistence note

The auth flow is intentionally a **local demo implementation**. It does not store real passwords and does not connect to a production auth provider yet. Its purpose is to validate the product experience and prepare the structure for a future real integration.

Watchlists, portfolio transactions and price alerts are persisted locally per demo user. This keeps the app fully usable as a frontend portfolio project while keeping the architecture ready for a backend such as:

- AWS Cognito + API Gateway + Lambda + DynamoDB + EventBridge.
- Supabase Auth + Supabase Database.

For this portfolio project, the AWS path is the strongest option because it aligns with a React/TypeScript/AWS full-stack profile.

## Suggested Git workflow

```bash
git checkout main
git pull origin main
git checkout -b feature/cryptopulse-v30
```

Replace the project files with this v3.1 package, then run:

```bash
npm install
npm run quality
git add .
git commit -m "chore: prepare CryptoPulse v3.1 portfolio release" -m "Adds portfolio-ready documentation, case study page, SEO metadata, Vercel config, GitHub Actions CI, Vitest tests and final release polish."
git push -u origin feature/cryptopulse-v30
```

Then open a pull request from:

```txt
feature/cryptopulse-v30 -> main
```

## Roadmap after v3.1

- Real authentication with AWS Cognito.
- Persist watchlists, portfolio and alerts in DynamoDB.
- Scheduled alert evaluation with EventBridge + Lambda.
- API Gateway endpoints for user data.
- Component tests with Testing Library.
- E2E smoke tests with Playwright.
- Lighthouse performance pass after route/code splitting.

## v3.1 Professional UI/UX Polish

This release focuses on making CryptoPulse feel more like a professional product demo. It introduces a redesigned hero section, sticky market intelligence header, refined card/table hierarchy, improved light/dark presentation and a no-login local workspace so recruiters can explore watchlists, portfolio simulation and alerts without friction.


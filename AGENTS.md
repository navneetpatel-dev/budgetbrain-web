# Web — Architecture & Folder Structure

Authoritative shape: `../structure/web-admin/WEB-STRUCTURE-CONVENTIONS.md` and `../structure/web-admin/NEXTJS-STRUCTURE-CONVENTIONS.md`, with the accepted deviations below. This file describes the code as it is.

Next.js 15 App Router. `admin` is a **separate app/repo** (`../admin`) — the Next.js doc's illustrative `app/(storefront)/`, `app/admin/`, `app/vendor/` route groups describe a different, combined-app scenario and do not apply here. This app's real route groups are `(app)/` (the authenticated product area) and `(auth)/`.

## Overview

```
web/
└── src/
    ├── app/                  # App Router routes (thin re-exports)
    │   ├── (app)/            # authenticated product area
    │   └── (auth)/           # login, register, password flows
    ├── features/             # Domain modules
    └── shared/               # Cross-feature code and app infrastructure
```

**Import paths**

- Features: `@/features/<domain>/...`
- Shared: `@/shared/...`

Cross-feature imports go through a feature's `index.ts` barrel only. `eslint.config.*` enforces this with `no-restricted-imports` (`noRestrictedFeatureImports`) — reaching into another feature's `api/`, `hooks/`, `components/`, `pages/` internals is a lint error, not just a convention.

---

## Feature module structure

```
src/features/<domain>/
├── api/<functionality>/            # Thin network wrappers only (*.api.ts)
├── components/<functionality>/     # Presentational UI (*.component.tsx)
├── hooks/<functionality>/          # State, effects, handlers (*.hook.ts)
├── pages/<functionality>/          # One page per route (*.page.tsx)
├── styles/<functionality>/         # Tailwind `as const` dictionaries (*.styles.ts)
├── utils/                          # Pure functions (plain .ts)
├── types/                          # Request/response and shared form types (*.types.ts)
├── constants/                      # Feature constants, when there is something to name
└── index.ts                        # Public barrel
```

One file for a concern stays flat; two or more files for the same functionality get a `<functionality>/` subfolder (this is why most features nest a single subfolder under `hooks/`, `pages/`, etc. named after the feature itself). Do not add an empty layer folder — several features (e.g. `accounts`, `integrations`, `legal`, `search`) have only `pages/` (+ `hooks/`) because that's all they need; they call `shared/services/api.ts` directly from a thin hook rather than carrying an empty `api/` folder.

### Layer rules

| Suffix | Allowed | Forbidden |
|---|---|---|
| `.component.tsx` | Presentation, composition, conditional rendering of already-computed values | `useState`/`useEffect`, API calls, data transformation, inline `.map()`, inline arrow handlers (except a callback that binds one row id), hardcoded `className="..."` |
| `.page.tsx` | Compose that page's hooks and components | Its own business logic, API calls, inline list rendering |
| `.hook.ts` | State, effects, API orchestration, event handlers, derived state | JSX |
| `.api.ts` | Network calls only, one function per endpoint | Business logic, React state, JSX |
| `.styles.ts` | Named Tailwind `as const` class dictionaries | Logic beyond a simple ternary/variant select |
| `app/**/page.tsx` | Re-export one feature `.page.tsx` + `metadata` | Hooks, API calls, styles, lists |
| `app/**/error.tsx` | `"use client"`, `{ error, reset }`, shared error-boundary styles | Feature-specific recovery logic |

Every dynamic/static route segment that can throw during render gets an `error.tsx`; children inherit the nearest ancestor's unless their settled UI genuinely needs a different one.

---

## Accepted deviations

These are intentional. Do not "fix" them back toward the generic doc's folder names.

1. **`api/` vs `services/` is settled as `api/`.** A handful of features (`categories`, `family`, `net-worth`, `subscriptions`, `billing`, `auth`) have an `api/` folder; the rest call `shared/services/api.ts` directly from a hook when there's only one simple endpoint. Do not reintroduce `services/` inside a feature.
2. **`shared/services/` is a named category** for cross-cutting infrastructure — the HTTP client (`api.ts`), React Query client/invalidation, and monitoring — not feature network wrappers, and not moved into a feature's `api/`.
3. **`shared/theme/`** (not `shared/styles/tokens/`) is the token layer — colors, motion, text styles, palettes. Extend it in place; do not add a second token folder.
4. **Singular route/feature pairs are intentional**, not duplication: `(app)/budget/` + `(app)/budgets/`, `expense/` + `expenses/`, `goal/` + `goals/`, `income/` (list+detail combined) + `loan/` + `loans/` are detail-vs-list route pairs, not accidental drift.
5. **No `features/shared/` pseudo-feature.** Cross-feature hooks live in `shared/hooks/` only.

`shared/containers/` holds app-level provider/layout wiring (`AppProviders`, `AuthBootstrap`, `TabLayout`, `DesktopSidebar`) mounted once at the root layout, not per-feature.

---

## Example: `dashboard` feature

```
src/features/dashboard/
├── components/dashboard/
│   ├── DashboardHero.component.tsx
│   ├── CategoryChart.component.tsx
│   └── SpendingTrendChart.component.tsx
├── hooks/dashboard/
│   └── useDashboard.hook.ts
├── pages/dashboard/
│   └── Dashboard.page.tsx
├── styles/dashboard/
│   └── dashboard.styles.ts
└── index.ts
```

**Route file** (`src/app/(app)/(tabs)/dashboard/page.tsx`):

```tsx
export { DashboardPage as default } from '@/features/dashboard/pages/dashboard/Dashboard.page';
```

---

## Shared layer

```
src/shared/
├── components/         # Design-system primitives (*.component.tsx)
│   ├── ui/
│   └── brand/
├── containers/         # App-level providers and layout shells
├── hooks/              # App-wide hooks (*.hook.ts)
├── services/           # HTTP client, query client/invalidation, monitoring (see deviation 2)
├── store/              # Redux slices (auth, settings) — cross-feature state
├── theme/              # Token layer (see deviation 3)
├── types/
├── utils/
├── constants/
└── validation/
```

There is no feature-level `stores/` folder. Global state stays in `shared/store/`.

---

## Guardrails (ESLint)

- **`no-restricted-imports`** blocks reaching into another feature's internals; import from that feature's `index.ts` barrel instead.
- **Money-math rule** (`no-restricted-syntax`) blocks client-side arithmetic on `price`/`amount`/`total`/`subtotal`/`discount`/`refund`/`payout`/`commission`/`balance`-named identifiers under `src/features` and `src/shared`. If a page needs a total, the API returns it — do not add an allowlist entry to route around this.

---

## Naming conventions

| Item | Convention | Example |
|---|---|---|
| Feature folder | lowercase domain | `auth`, `expenses`, `budgets` |
| Component | PascalCase + `.component.tsx` | `DashboardHero.component.tsx` |
| Hook | `use` + PascalCase + `.hook.ts` | `useDashboard.hook.ts` |
| Page | `<Name>Page.page.tsx` | `Dashboard.page.tsx` |
| API | `<name>.api.ts` under `api/` | `auth.api.ts` |
| Styles | `<functionality>.styles.ts` | `dashboard.styles.ts` |
| Types | `<domain>.types.ts` | `auth.types.ts` |
| Util | plain `.ts` | `currency.ts` |

---

## Adding a new feature

1. Create `src/features/<domain>/` and add only the layers that have files (`pages/` at minimum; `api/`/`hooks/`/`components/`/`styles/` as needed).
2. Put network calls in `api/<functionality>/<name>.api.ts` when there's more than a trivial single call; otherwise call `shared/services/api.ts` from the hook directly.
3. Name files with the suffix table above. Take Tailwind classes from a `.styles.ts` dictionary — never inline `className="..."` with utility classes in JSX.
4. Export a public `index.ts` when another feature needs to import from this one — that barrel is the only allowed cross-feature import surface (ESLint enforces this).
5. Add a thin route in `src/app/(app)/` or `src/app/(auth)/` that re-exports the `.page.tsx`, plus `metadata`. Add `error.tsx` if the segment can throw during render and the inherited one is the wrong shape.

## Verification gate

Before considering any change done: `npm run typecheck`, `npm run lint` (covers the barrel-import and money-math rules), unit tests, `npm run dev`, and a breakpoint pass (phone/tablet/desktop, light/dark) for anything touching a `.styles.ts` file.

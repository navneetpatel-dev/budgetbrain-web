# Web — Structure Migration Plan

**Scope note:** `./web` is confirmed Next.js 15 App Router (`next dev`/`next build` in package.json). The authoritative specs are `../structure/web-admin/WEB-STRUCTURE-CONVENTIONS.md` (generic) and `../structure/web-admin/NEXTJS-STRUCTURE-CONVENTIONS.md` (Next.js specifics). `web/` has no competing `AGENTS.md`/`CLAUDE.md` of its own, so these two docs are the only spec.

The Next.js doc's illustrative route tree (`app/(storefront)/`, `app/admin/`, `app/vendor/`) assumes one combined app. This repo instead splits web (customer-facing) and admin into **separate repos** (`./web` and `./admin`, per root `README.md`). Web's real route groups are `(app)/` (authenticated product area) and `(auth)/`. **Do not** treat the missing `admin`/`vendor` groups as a gap — only the doc's generic rules apply to web's actual shape.

## Compliance summary

| Rule area | Status | Evidence |
|---|---|---|
| App Router thinness (`page.tsx` re-exports) | ✅ Good | Sampled `page.tsx` files are 5 lines each (`accounts`, `reports`, `login`) |
| `error.tsx` coverage | ✅ Good (inherited) | Root, `(app)/`, `(auth)/` each have `error.tsx`; children inherit — matches doc intent |
| `loading.tsx` — only where needed | ✅ Good | Only `(app)/(tabs)/dashboard/loading.tsx` exists; doc says add only when the inherited skeleton is wrong |
| `.page.tsx` suffix on feature pages | ✅ Adopted | 45 files use `.page.tsx` |
| `.hook.ts` / `.component.tsx` / `.api.ts` / `.styles.ts` suffixes | ❌ Not adopted | Only 2 / 2 / 1 / 1 files repo-wide use these suffixes; hooks use plain `useX.ts`, components use plain `PascalCase.tsx` |
| Tailwind class-dictionary styling (`.styles.ts` `as const`) | ❌ Not adopted | Only `ErrorBoundary.styles.ts` exists; 14 of 72 feature `.tsx` files have inline `className="..."` literals |
| `api/` vs `services/` naming | ⚠️ Inconsistent | 6 features use `services/`, 1 (`net-worth`) uses `api/`, 13 features have neither folder |
| `features/shared/` pseudo-feature | ❌ Violation | `src/features/shared/hooks/useFeatures.ts` duplicates the role of the real `src/shared/` |
| Cross-feature barrel imports | ❌ Violation | 29 files import another feature's internals directly (`@/features/x/hooks/...`, `.../services/...`, `.../components/...`) instead of that feature's `index.ts` |
| Cross-feature import lint (`no-restricted-imports`) | ❌ Missing | No such rule in `eslint.config.*` |
| Money-math client-arithmetic lint | ✅ Exists, ⚠️ one leak | Rule exists (`no-restricted-syntax`, §8 comment); but `subscriptions/pages/Subscriptions.page.tsx` still computes `amount * 4.345` / `amount / 12` client-side, and `family/components/SplitWithFamilyField.tsx` divides `amount` client-side |
| Overlay inventory (toast, tab bar, cookie banner, FAB) | ⚠️ Unclear | No dedicated `Toast` component or toast library dependency found under `shared/`; `TabLayout.tsx`/`DesktopSidebar.tsx` exist in `shared/containers/` but no documented inventory |
| Singular vs plural route folders (`budget/` + `budgets/`, etc.) | ℹ️ Needs a decision | `(app)/budget/`, `expense/`, `goal/`, `income/`, `loan/` exist alongside `budgets/`, `expenses/`, `goals/`, `incomes/`→`income/`, `loans/` — confirm these are intentional detail-vs-list route pairs before renaming anything else that touches them |

## Findings (prioritized)

1. **`src/features/shared/`** is a rogue "feature" duplicating the real `src/shared/` (doc §3). `useFeatures.ts` inside it is imported by `expenses`, `family`, `income`, `search` — i.e. it's genuinely cross-feature and belongs in `src/shared/hooks/`, not in a fake feature named `shared`.
2. **29 cross-feature deep imports** bypass feature barrels (doc §8), e.g. `expenses/pages/AddExpense.page.tsx` imports `@/features/categories/hooks/useCategories` and `@/features/family/components/SplitWithFamilyField` directly; `settings` and `auth` reach into each other's `hooks/`/`services/` directly. No `index.ts` barrel is consistently used as the import surface, and no lint rule blocks the anti-pattern.
3. **No `.styles.ts` dictionary system in practice** — 14 components hardcode `className="..."` directly in JSX (doc §7/§3 Next.js file: "Never `className=\"flex items-center ...\"`"). The one `.styles.ts` file that exists (`ErrorBoundary.styles.ts`) is the exception, not the pattern.
4. **`.hook.ts`/`.component.tsx`/`.api.ts` suffixes are effectively unused.** Real convention in this codebase is plain `useX.ts` / `PascalCase.tsx` / `x.service.ts`. This is a repo-wide naming decision, not a few stragglers — renaming ~150+ files is the actual size of this gap.
5. **`api/` vs `services/` split is inconsistent**: `net-worth/api/netWorth.api.ts` is the only `.api.ts`-suffixed, `api/`-housed file; `auth`, `billing`, `budgets`, `expenses`, `family`, `goals`, `income` all use `services/*.service.ts` instead. 13 features (`accounts`, `categories`, `dashboard`, `integrations`, `investments`, `legal`, `notifications`, `onboarding`, `reports`, `search`, `settings`, `subscriptions`, `support`) have neither — verify each calls the shared API client directly from its hook (acceptable per doc only if thin) rather than having no data layer at all.
6. **Money-math leak**: `subscriptions/pages/Subscriptions.page.tsx` computes `series.amount * 4.345` and `series.amount / 12` client-side to normalize billing cadence, directly contradicting doc §12/§8 even though its own comment cites the rule. `family/components/SplitWithFamilyField.tsx` computes `shareAmount` (an even-split preview) client-side — confirm with product whether this is a pure UI preview (acceptable) or should come from the API.
7. **No overlay inventory** exists for toast/tab-bar/cookie-banner/FAB coordination (doc §6). No `Toast` component or toast library dependency was found at all — either toasts aren't implemented yet, or they live somewhere not discovered by this audit; verify manually before writing the phase-4 checklist item below.

## Recommended target folder shape

Using `net-worth` (has the closest-to-conforming shape, needs an `.api.ts` rename + hook renames) as the worked example:

```
Current                                          → Target
src/features/net-worth/
  api/netWorth.api.ts                             api/net-worth/netWorth.api.ts
  hooks/useNetWorth.ts                            hooks/net-worth/useNetWorth.hook.ts
  pages/NetWorth.page.tsx                         pages/net-worth/NetWorth.page.tsx
  index.ts                                        index.ts   (barrel — unchanged, becomes the ONLY
                                                               cross-feature import surface)
```

And for a "neither api/ nor services/" feature (`dashboard`):

```
Current                                          → Target
src/features/dashboard/
  components/DashboardHero.tsx                    components/dashboard/DashboardHero.component.tsx
  components/CategoryChart.tsx                    components/dashboard/CategoryChart.component.tsx
  components/SpendingTrendChart.tsx                components/dashboard/SpendingTrendChart.component.tsx
  hooks/useDashboard.ts                            hooks/dashboard/useDashboard.hook.ts
  pages/Dashboard.page.tsx                         pages/dashboard/Dashboard.page.tsx
  (no styles/)                                     styles/dashboard/dashboardHero.styles.ts (extract
                                                    the 14 inline className usages found repo-wide,
                                                    dashboard's share of them, into dictionaries)
  index.ts                                         index.ts
```

## Step-by-step migration plan

### Phase 0 — decisions before touching files
- [ ] Confirm with product/eng whether `(app)/budget/` vs `budgets/` (and the `expense/`, `goal/`, `income/`, `loan/` singular siblings) are intentional detail+list route pairs. If yes, no action; if accidental drift, fold into one and update links.
- [ ] Confirm whether a toast/notification primitive exists under a name this audit didn't match (e.g. inside a UI library) before writing a shared `Toast` component from scratch.

### Phase 1 — fix the real structural violation first (lowest risk, highest doc-authority)
- [ ] Move `src/features/shared/hooks/useFeatures.ts` into `src/shared/hooks/useFeatures.hook.ts` (split into per-concern hooks if it exports unrelated hooks for `expenses`, `family`, `income`, `search` — check its contents before moving as one file).
- [ ] Delete the now-empty `src/features/shared/` directory.
- [ ] Update the 4+ importers (`expenses/pages/AddExpense.page.tsx`, `expenses/pages/ExpenseDetail.page.tsx`, `family/components/SplitWithFamilyField.tsx`, `family/pages/Family.page.tsx`, `income/pages/IncomeDetail.page.tsx`, `search/pages/Search.page.tsx`) to import from `@/shared/hooks`.

### Phase 2 — enforce feature barrels
- [ ] Add every feature's public exports (hooks, components, services/api functions consumed elsewhere) to that feature's `index.ts` if not already there.
- [ ] Rewrite the 29 flagged deep imports (see Findings #2) to import from the owning feature's barrel instead of its internal folder. Priority order: `settings` ↔ `auth` cross-imports first (most files), then `expenses` → `categories`/`family`, then the rest.
- [ ] Add an ESLint `no-restricted-imports` rule (patterns: `@/features/*/api/**`, `@/features/*/hooks/**`, `@/features/*/services/**`, `@/features/*/components/**`) with an exception for imports from within the same feature. Model the message on the existing money-math rule's style (cite `WEB-STRUCTURE-CONVENTIONS.md §6`).

### Phase 3 — standardize the data-layer folder name
- [ ] Decide `api/` (matches generic doc's canonical name) vs `services/` (majority usage today, 6 features) as the single name going forward. **Recommendation: standardize on `api/` + `.api.ts`** since it's what both convention docs name explicitly; `services/` doesn't appear in either doc.
- [ ] Rename `services/` → `api/` and `*.service.ts` → `*.api.ts` in: `auth`, `billing`, `budgets`, `expenses`, `family`, `goals`, `income` (7 features, ~15 files — grep each for internal cross-references before renaming).
- [ ] Rename `net-worth/api/netWorth.api.ts` path to nest under `api/net-worth/` per the generic doc's `<functionality>` subfolder rule (only 1 file today — flat is technically fine per rule 2's "one file → flat"; leave flat unless a second net-worth API file is added later).
- [ ] For the 13 features with neither folder, read their hooks and confirm each either (a) calls `shared/api` directly for a single simple endpoint (acceptable, no action) or (b) has enough endpoint logic to warrant its own `api/<feature>.api.ts` (extract it). Do this feature-by-feature; do not batch-create empty `api/` folders speculatively (doc §2: don't over-nest).

### Phase 4 — suffix renames (largest phase, do per-feature, verify build after each)
Per-feature checklist — rename `hooks/useX.ts` → `hooks/<functionality>/useX.hook.ts`, `components/X.tsx` → `components/<functionality>/X.component.tsx`, keep `.page.tsx` as-is (already conforms):

| Feature | Hook files | Component files | Priority |
|---|---|---|---|
| dashboard | 1 | 3 | High (touched often) |
| settings | 6 | several | High (most cross-feature imports) |
| auth | several | several | High (security-sensitive, careful review) |
| expenses | several | several | Medium |
| family | several | several | Medium |
| budgets, goals, income, loans, accounts, categories | few each | few each | Medium |
| ai, billing, integrations, investments, legal, net-worth, notifications, onboarding, reports, search, subscriptions, support | 0–2 each | 0–2 each | Low |

- [ ] Work top-to-bottom by priority; after each feature's renames, run `npm run typecheck` and `npm run lint` before moving to the next (doc's verification gate, applied incrementally instead of one giant rename commit).

### Phase 5 — styling system
- [ ] For each `className="..."` literal found in the 14 flagged files, extract into a `<Feature>.styles.ts` (or per-component) `as const` Tailwind dictionary under that feature's new `styles/<functionality>/` folder.
- [ ] Do not introduce a new CSS framework or CSS-in-JS — the doc mandates exactly one system (Tailwind dictionaries); this phase is extraction only, not a rewrite of visual design.

### Phase 6 — money-math and overlay follow-ups
- [ ] Fix `subscriptions/pages/Subscriptions.page.tsx`: request a normalized-cadence amount from the API instead of computing `* 4.345` / `/ 12` client-side, or move the constant-cadence math into a clearly-non-money-named local display helper if product confirms it's a display-only estimate (get explicit sign-off either way — this is the doc's one explicit financial-correctness rule).
- [ ] Resolve `SplitWithFamilyField.tsx`'s `shareAmount` the same way — confirm scope with whoever owns the split-expense feature before changing.
- [ ] Once Phase 0's toast question is answered: either document the existing toast mechanism's location in `shared/`, or build one `Toast` primitive plus the doc's required overlay inventory (toast + `(tabs)` tab bar + cookie banner + scroll-to-top FAB + compare bar) in one pass so future overlays are positioned against a real inventory instead of guessed.

### Phase 7 — verification gate (run after each phase, not just at the end)
- [ ] `npm run typecheck`
- [ ] `npm run lint` (confirms the new `no-restricted-imports` and existing money-math rules both pass)
- [ ] unit tests
- [ ] `npm run dev` + manual breakpoint pass (phone/tablet/desktop, light/dark) for any page touched in Phase 5

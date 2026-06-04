# Copilot instructions for Library-Test

## Project type

This is a **Power Pages Code Site** — a React + TypeScript SPA deployed to Microsoft Power Pages via PAC CLI. It is not a standalone web app; the compiled `dist/` output is uploaded to a Power Pages environment backed by Dataverse.

- Power Pages environment: `https://pulgasandbox.crm4.dynamics.com/`
- Deployment config: `powerpages.config.json` (maps `dist/` as the compiled path)
- Portal metadata: `.powerpages-site/` (web pages, web roles, site settings as YAML)

## Build / dev / preview

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build (type-check then bundle)
npm run preview    # preview the build output
npx tsc --noEmit   # type-check only, no output files
```

E2E tests: Playwright is a devDependency but no test scripts are configured yet.
```bash
npx playwright test path/to/test.spec.ts       # single file
npx playwright test -g "test name"             # single test by name
```

## High-level architecture

- **Entrypoint**: `src/main.tsx` — mounts `<App/>` into `#root` via `ReactDOM.render` with `BrowserRouter`.
- **Routing**: react-router-dom **v5** (`Switch`/`Route`/`component=`) defined in `src/App.tsx`. Do not use v6 APIs (`Routes`, `element=`).
- **Layout**: `src/components/Layout.tsx` wraps every page with `<Navbar>` and `<Footer>`.
- **Pages**: `src/pages/*.tsx` — Home, Catalog, Account, Contact, About.
- **Styling**: CSS custom properties defined in `src/styles/theme.css`; components use inline style objects referencing those variables (no CSS modules).
- **Build target**: `es2015` (set in `vite.config.ts`).

## Dataverse data model

Defined in `.datamodel-manifest.json`. Tables use the `lpulga_` publisher prefix.

| Table logical name | Display name | Key columns |
|---|---|---|
| `lpulga_libraryitem` | Library Item | `lpulga_name`, `lpulga_author`, `lpulga_excerpt`, `lpulga_imgid`, `lpulga_externalid` |
| `lpulga_webmessage` | Web Message | `lpulga_name`, `lpulga_email`, `lpulga_message` |

The catalog currently uses a hardcoded `ITEMS` array in `src/pages/Catalog.tsx`. When connecting to live data, replace it with Web API calls to `lpulga_libraryitem`. Contact form submissions should write to `lpulga_webmessage`.

## Power Pages portal structure (`.powerpages-site/`)

- `web-pages/` — one folder per portal page; contains `.webpage.yml`, `.webpage.copy.html`, `.webpage.custom_javascript.js`, `.webpage.custom_css.css`
- `web-roles/` — Administrators, Anonymous-Users, Authenticated-Users
- `site-settings/` — authentication, search, feature flags as `.sitesetting.yml` files
- `website.yml` — site root config (id, name, language)

When adding portal-level features (auth, search, Web API access), edit the relevant files under `.powerpages-site/` and deploy with PAC CLI.

## Key conventions

- **react-router-dom v5 only**: use `Switch`, `Route`, `component=`, `NavLink` with `activeClassName`. Never use v6 patterns.
- **URL-based search**: `SearchBar` navigates to `/catalog?q=...` via `history.pushState` + `dispatchEvent(new PopStateEvent('popstate'))`. `Catalog` reads `window.location.search` directly (not `useLocation`). Preserve this pattern.
- **Inline styles + theme variables**: use `var(--color-primary)`, `var(--color-surface)`, etc. (defined in `theme.css`) for all color/border/font values in inline style objects.
- **Unsplash image helper**: `CatalogCard` builds image URLs from an `imgId` string (Unsplash photo ID). When adding catalog items, supply an `imgId` in the same format.
- **MUI available**: `@mui/material` and `@mui/icons-material` are installed — check existing components before adding another UI library.
- **Publisher prefix**: all custom Dataverse columns/tables use the `lpulga_` prefix. Follow this when extending the data model.

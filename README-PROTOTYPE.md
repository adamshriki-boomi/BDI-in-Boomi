# BDI × Exosphere — Live Prototype

A live prototype of **Boomi Data Integration (BDI)** — the cloned Rivery front-end
(`react_rivery`) running locally on a **mock backend** — used to evaluate how the
Exosphere **Leftnav** (`ExLeftMenubar`) and **Masthead** (Boomi platform top bar)
integrate with BDI. You can flip between four versions live:

| Version | `leftnav` | `masthead` |
|---|---|---|
| Original Rivery | `rivery` | `off` |
| Exosphere Leftnav | `exo` | `off` |
| Exosphere Masthead | `rivery` | `exo` |
| **Both** | `exo` | `exo` |

---

## Prerequisites

- **Node 18.20.8** (pinned in `.nvmrc`). Install via `nvm`: `nvm install 18.20.8 && nvm use`.
- A hosts entry so the app can serve over its expected SSL domain (already present on the dev machine):
  ```
  127.0.0.1 localhost.rivery.in
  ```
- The SSL cert is auto-provisioned by `vite-plugin-mkcert` on first run (cert files also live in `.cert/`).

## Run it (mock backend — default)

```bash
nvm use                         # Node 18.20.8
export NODE_TLS_REJECT_UNAUTHORIZED=0   # corporate TLS (zscaler) workaround
npm install
npm start                        # vite dev server
```

Open **https://localhost.rivery.in:3000/** (accept the local self-signed cert).

- A local override file **`.env.development.local`** (gitignored) sets `VITE_PORT=3000`
  (avoids needing `sudo` for port 443) and `VITE_USE_MOCKS=true`.
- The app **auto-logs-in via MSW mocks** and lands on the authenticated shell — no real
  backend or credentials needed. Mock identity: *Adam Shriki* / account *Boomi Data
  Integration* / env *Production*.

## Switching the four versions

Two flags drive everything: `leftnav ∈ {rivery, exo}` and `masthead ∈ {off, exo}`.

- **Dev switcher** — a floating "BDI Prototype" panel (bottom-right) toggles both flags live.
- **URL params** — e.g. `…:3000/?leftnav=exo&masthead=exo` (persisted to localStorage).
- **Env defaults** — `VITE_BDI_LEFTNAV` / `VITE_BDI_MASTHEAD` in an env file.

## Switching to a real staging/dev backend

In `.env.development.local` set `VITE_USE_MOCKS=false`, then point the API at your
environment (these already have dev defaults in `.env.development`):

```
VITE_USE_MOCKS=false
VITE_API_BASE_URL_DEFAULT=https://api.dev.rivery.in/v1
VITE_PROXY=https://console.dev.rivery.in/
```

With mocks off the app uses the real `LoginGuard` (you'll sign in normally) and live data.

---

## Where things live (prototype additions)

| Area | Path |
|---|---|
| Version toggle (config, context, dev switcher) | `src/modules/BdiPrototype/` |
| Exosphere Leftnav (`ExLeftMenubar`) | `src/components/Exosphere/ExoLeftnav/` |
| Exosphere Masthead (Figma `5253:11156`) | `src/components/Exosphere/ExoMasthead/` |
| Shell integration (renders nav/masthead by flag) | `src/app/AuthenticatedApp.tsx` |
| Provider + switcher mount | `src/app/App.tsx` |
| MSW mock backend (handlers, fixtures, worker) | `src/mocks/` (started in `src/index.tsx`) |
| Custom-component register | `EXOSPHERE-CUSTOM.md` |

## Notable implementation details

- **Exosphere upgraded** `7.3.0 → 7.10.0` (`package.json`).
- **`headers-polyfill` pinned to `3.0.4`** via `package.json` `overrides` — `msw@0.44.2`
  needs it (`headers.all()` + `headers-polyfill/lib`); newer versions break the Vite build.
- **Leftnav icons** use Exosphere `ExIcon` (Rivery's own SVGs are authored white for the
  dark sidebar and vanish on the light Exo nav). The menubar is rendered once + `selected`
  applied imperatively (the web component relocates slotted icons, so a re-render would
  destroy them). It carries `z-index` to sit above the legacy `/ng` iframe.
- **Masthead** is a flagged custom composite (Exosphere has no single Masthead component):
  `ExIconButton` + tokens, a token-styled env pill + nav tabs, the Boomi logo, and the
  Agent Studio mark recomposed from the Figma source layers. See `EXOSPHERE-CUSTOM.md`.
- **In Both mode**, the leftnav drops its own brand + user row (the masthead carries them).

## Known limitations (by design for this prototype)

- The main content area is the legacy **Angular `/ng` iframe**, which stays blank on the
  mock backend (irrelevant to evaluating the nav/masthead chrome). Newer React surfaces
  (e.g. the Dashboard) render normally.
- The masthead's primary nav (Dashboard/Build/Deploy/Manage) and the Agent Studio icon are
  representative; deep data beyond the shell isn't mocked.

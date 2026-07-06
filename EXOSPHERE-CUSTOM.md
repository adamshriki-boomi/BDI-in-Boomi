# Exosphere — Custom Extensions

Components built for this project that Exosphere does not ship as a single component.
All are styled strictly with Exosphere `--exo-*` tokens / palette values and composed
from shipped Exosphere primitives where possible.

## ExoMasthead — `src/components/Exosphere/ExoMasthead/`

The Boomi platform **Masthead** (global top bar). Exosphere does not export a single
Masthead component — it is a platform pattern. This is a flagged custom composite that
reproduces Figma node `5253:11156` (file `tiKPfwTdw9PLZ6Dcfb222L`, "Size=>XL-1200,
Auth=True"): a dark navy (`--exo-palette-navy-80` / `#072b55`) 56px bar.

- **Shipped Exosphere primitives used:** `ExIconButton` (`type="tertiary"`,
  `variant="inverse"`; icons `magnifying-glass`, `information`, `envelope-closed`,
  `squares`; mail uses the `indicator` dot).
- **Token-styled custom parts:** the env badge (Figma uses Exosphere's warning
  tokens `--exo-color-background-warning` / `-strong`; the shipped `ExPill`
  `color="yellow"` renders white in this 7.10.0 build, so the badge is a span with
  those exact tokens), the logo lockup (downloaded Boomi 2-color logo SVG +
  "Data Integration"), and the bordered user pill (`#8395aa` outline). The Agent
  Studio brand icon is a temporary colorful placeholder. The Figma's primary nav
  tabs (Dashboard/Build/Deploy/Manage) are intentionally omitted — the leftnav is
  the app's navigation, so duplicating it in the masthead adds no value.
- **Data:** env badge from `useSelectedEnvironment()`, user/account from `useCore()`.
- Rendered only when the prototype toggle `masthead=exo` (see `modules/BdiPrototype`).

## ExoLeftnav Create / Env / Ask AI extensions — `src/components/Exosphere/ExoLeftnav/`

Restores the affordances the first Exosphere-leftnav rebuild dropped vs. Rivery.
Approved by Adam Shriki on 2026-07-06. All tokens-only; each reuses Exosphere
primitives + the real Rivery data/actions where possible.

- **`ExoSideFlyout.tsx`** — a **left-anchored** slide-out panel (portaled to
  `<body>`, fixed, flush against the nav's right edge, with backdrop + Esc-close).
  Exosphere's shipped `ExSideDrawer` is right-anchored only, so this recreates
  Rivery's left flyout direction. Colors from `--exo-color-shadow-*` /
  `-background` / `-border-secondary`.
- **`ExoCreateFlyout.tsx`** — Exosphere reskin of the "Create Data Pipelines &
  Workflows" panel. Cards are token-styled `<button>`s; the four options, copy,
  routes and the Logic-Flow draft side-effect are **reused** from the shipped
  `riverItems` catalog + `useRiverRouteBuilder` / `useRiverBuilder` /
  `RoutesBuilder.kits` (not re-implemented). The card illustrations reuse Rivery's
  own SVGs for recognizability.
- **`ExoEnvSelector.tsx`** — the account/environment pill trigger (Exosphere
  ExIcon caret + env color swatch). The switcher **drawer body reuses Rivery's
  `AccountEnvSelection`** verbatim inside `ExoSideFlyout`.
- **Ask AI row** (in `index.tsx`) — a token-styled `<button id="ask-ai-button">`
  (periwinkle `--exo-color-data-solid-periwinkle`, `star-fill` icon). No onClick:
  the external Kapa.ai widget binds to the `id` (`modules/LoadExternals/KapaAndCandu`).
- **Create button + Blueprints link** (in `index.tsx`) — the Create CTA is a
  shipped `ExButton` (`secondary`/`base`, outlined so it doesn't shout over the
  nav) with the `plus` `ExIcon` in the button's `slot="prefix"` (the button sizes
  the icon and sets the icon/text gap via its own `::slotted` rule — no manual
  size or gap). Blueprints is a normal `ExLeftmenubarLink` (icon `document`,
  route `/blueprints/:acc/:env/blueprints`).

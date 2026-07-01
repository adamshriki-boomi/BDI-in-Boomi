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
  those exact tokens), the nav tabs (Dashboard/Build/Deploy/Manage; active `#395577`,
  inactive text `#b5bfcc`), the logo lockup (downloaded Boomi 2-color logo SVG +
  "Data Integration"), and the bordered user pill (`#8395aa` outline). The Agent
  Studio brand icon is a temporary colorful placeholder.
- **Data:** env badge from `useSelectedEnvironment()`, user/account from `useCore()`.
- Rendered only when the prototype toggle `masthead=exo` (see `modules/BdiPrototype`).

---
name: add-pendo-id
description: How to correctly add a Pendo analytics locator (data-pendo-id) to a component in this repo. Use when asked to add/move/fix a Pendo id, a pendo tag, a tracking locator, or wire an element to Pendo. The golden rule - the id must end up on the immediate interactive DOM element (the real button/input/anchor/panel), never on a wrapper above it.
---

# Adding a Pendo ID the right way

Pendo locates elements by CSS selector (`[data-pendo-id="..."]`) on **real DOM nodes**. The Pendo team requires the id to sit on the *immediate corresponding component* — the actual `<button>`/`<input>`/anchor/panel the user interacts with — not on a wrapper element above it.

## Step 1 — Define the tag constant

All locators live in [src/utils/tracking.tags.ts](../../../src/utils/tracking.tags.ts), grouped by feature into exported `*Tags` objects. Reuse the matching group; only create a new `export const XxxTags = { ... }` if none fits. Never scatter raw strings in components.

Each entry has TWO distinct parts — keep them separate:

- **Constant name** — `SCREAMING_SNAKE_CASE` describing the element + its kind. Examples: `ADD_RIVER_BUTTON`, `EDIT_APPLY_CHANGES_BUTTON`, `SEARCH_INPUT`, `STATUS_DROPDOWN`, `SAVE_BUTTON`.
- **String value** — kebab-case in the shape `feature-element-type`, where `type` is the control kind (`button`, `input`, `dropdown`, `tab`, `card`, `toggle`, `link`, `datepicker`, `response`). Examples: `rivers-addriver-button`, `blueprints-edit-applychanges-button`, `environments-search-input`, `dashboard-filter-sources-dropdown`.

So a request like *'add a save-connection tag for the Save button on the Connections form'* becomes:

```ts
// Connections Tags
export const ConnectionsTags = {
  SAVE_BUTTON: 'connections-save-button',
};
```

Rules of thumb:
- Derive the value from the **feature + element + control type**, not from the user's loose phrasing — if they say `"save-connection"`, normalize to `connections-save-button` unless they insist on a specific literal string.
- Match the prefix of the group you're adding to (entries in `RiversTags` start `rivers-`, `DashboardFilterTags` start `dashboard-filter-`, etc.).
- A few legacy entries use `snake_case` values (parts of `ActivitiesTags`); do NOT copy that — new tags use the kebab `feature-element-type` form above.
- If anything is ambiguous (which group, which control type, the exact element), ask before writing.

## Step 2 — Apply it. Pick ONE of two ways:

### Option A — `<Tagger>` wrapper (preferred for most cases)
```tsx
import { Tagger } from 'components/Tracking/Tagger';

<Tagger tags={RiversTags.ADD_RIVER_BUTTON}>
  <SomeButton ... />
</Tagger>
```
`Tagger` (src/components/Tracking/Tagger.tsx) `cloneElement`s the child and **forwards `data-pendo-id` into it as a prop** — it does NOT add a wrapper element. This is correct ONLY if the child forwards the prop to its root DOM node (see Step 3).

### Option B — direct attribute (when you already control the leaf element)
```tsx
<Tab data-pendo-id={RiversTags.LIST_TAB}>…</Tab>
<ExButton data-pendo-id={SettingsNotificationsTags.ADD_BUTTON}>…</ExButton>
```
Use this when the element is a Chakra primitive or a component you're rendering directly that forwards `data-*`.

## Step 3 — Make sure the id reaches a real DOM node (the part that goes wrong)

Whichever option you pick, the id is passed as the `data-pendo-id` **prop** to the target component. If that component drops unknown props, the id silently disappears — worse than "too high." So:

- **Chakra primitives** (`Button`, `IconButton`, `Box`, `Text`, `Flex`, `Tab`, `Link`, `MenuButton`, `Input`…): forward `data-*` automatically. Nothing to do. ✅
- **Custom components**: the component MUST spread its rest/unknown props onto its outermost interactive element:
  ```tsx
  function MyButton({ label, onClick, ...rest }) {
    return <Button onClick={onClick} {...rest}>{label}</Button>; // {...rest} carries data-pendo-id
  }
  ```
  If the rest object can contain noise (e.g. a parent spreads a rich object), forward only the id explicitly: `data-pendo-id={rest['data-pendo-id']}`.

## Special cases

- **react-select wrappers** (`SelectFormGroup`, `CustomSelectForm`, `RiverTypeQuerySelect`, …): react-select does NOT render arbitrary `data-*`. The id is placed on `SelectFormGroup`'s root `<Box role="listbox">`. Thin wrappers must spread props down the chain so it reaches there. Don't pass it into react-select props.
- **Chakra `Modal` / `Drawer`**: these are context providers that render no DOM node — a `data-pendo-id` on `<Modal>`/`<Drawer>` is dropped. Put it on `<ModalContent>` / `<DrawerContent>` instead (the real panel).
- **ag-grid action menus** ([TableActionsMenu.tsx](../../../src/components/Exosphere/ExoTable/TableActionsMenu.tsx)): use the existing `triggerPendoId` / `option.pendoId` props — they `setAttribute` directly on the rendered button/menu-item DOM.
- **Table search input**: pass `filterInputProps={{ 'data-pendo-id': SomeTags.SEARCH_INPUT }}` — it lands on the actual `<input>`.

## Verify

1. `npx tsc --noEmit -p tsconfig.json` — catches prop-type regressions from new passthroughs.
2. `grep -rn "data-pendo-tag-wrapper" src` — must return nothing (the old wrapper pattern is gone).
3. Run the app, open devtools, confirm `[data-pendo-id="your-id"]` is on the real `<button>`/`<input>`/panel — NOT on a `display:contents` or wrapper `<div>` above it.

## Anti-patterns (do NOT do)

- ❌ Putting `data-pendo-id` on an outer layout `<Box>`/`<Grid>` that merely contains the real control.
- ❌ Wrapping a whole `<Drawer>`/`<Modal>` with `<Tagger>` expecting the id to land somewhere useful.
- ❌ Passing the id to a custom component that doesn't spread props (the id vanishes — fix the component to forward).
- ❌ Hardcoding the locator string inline instead of adding it to `tracking.tags.ts`.

See related background: the `Tagger` forwarding behavior and the full list of components already wired correctly is documented in the project memory `project_pendo_tagger_forwarding`.

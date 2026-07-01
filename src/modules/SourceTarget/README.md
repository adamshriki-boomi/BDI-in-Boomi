# Source Target package
this package should include everything related to connections that are used as source and targets

The goal is encapsulating components, rtk-queries and hooks of source/target. 

The main strategy for gathering user input (state) is using a form of  `react-hook-form`.

RTK-query is an api layer that to communicate CRUD operations of the river - create, read, update, delete.

## Architecture
the layers in this order:
- View - components & hooks
- State (Form) - gather input from user
- RTK - api layer to fetch, update, delete and perform related operations of river related

i.e:

```tsx
// demo - these are random names
import { SourceSetup, useSourcesGet, useTargetsMutation } from 'modules/SourceTarget'

// src/pages/river/RiverSourceToTarget/index.tsx
default function S2T() {
  const { data: sources } = useSourcesGet();
  const [updateTarget] = useTargetUpdateMutation();

  return (
    <Grid>
      <SourceSetup />
      <List items={sources} />
      <Button onClick={updateTarget}>update</Button>
    </Grid>
  )
}

```

## Form Controls
Some components include `react-hook-form` controls with a field name. The purpose is to reuse these components within a `<FormProvider />` for source-to-target creator (new) and editor.

These components are using `useFormContext()` to bind to the actual form that include a river.

To interact or bind river properties to a form control, few hook controllers are available at `SourceTarget/components/form.hooks.ts`.
There are `watchers` hooks and `controllers` hooks.

- `watchers` are for displaying data from the form state
- `controllers` are useful when it is required to update a form field

```typescript
const source = useSttSource();
console.log(source) // prints the river.properties.source json
const sourceFormApi = useSttController({ name: 'river.properties.source' });
// a typed react-hook-form useController api
const { field: { value, onChange } } = sourceFormApi;

```

The Form type follows:

```ts
interface RiverForm {
  river: IRiverV1;
  tests: {
    source: PollTestResponse;
    target: PollTestResponse;
  };
}
```
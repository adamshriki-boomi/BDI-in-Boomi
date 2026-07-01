# Table Settings Drawer

Table Settings is opened in a [TableSettingsDrawer](/src/modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSettingsDrawer.tsx)

Each tab is a component.

## State Management

It gets a `value` as the initial table's (from the river) data and an `onChange` callback to communicate any changes back to the river.

There is a new form context Inside the drawer - any changes and updates are saved to that form inside the drawer.

## Working with Form State in the drawer

The best way to consume the form's state is to use any of the typed hooks in [form.hooks.ts](/src/modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/form.hooks.ts)

Some of the hooks expose an interface of `{ value, update }` - use the update function to update the exact same path the hook holds, so the ONLY argument for the function is the DATA:

```tsx
const { value, update } = useTableettings('date_range')
update({ ...value, time_period: 'some_value' }
```

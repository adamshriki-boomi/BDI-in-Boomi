# River Validations

River Validations is a "feature".  
The concept of features includes all this feautre's logic and views inside this directory.
Then, the app is allowed to consume the exports of that feature.

The `useRiverValidator` hook must be consumed in order to update the river store. It is consumed in `<RiverBox/>`.

The validations feature is based on the [main useRiverValidator() hook](./hooks/useRiverValidator.ts).
it listens to the the current edited river steps change, runs validations on all steps and updates the store with the result.

That components within this feature, consume the river store, and by that are ready to be used in the app's views.

## river-error.resolver.ts

this is a validation resolver utility that is compatible with react-form-hook, but agnostic to it - meaning, it can run without react-form-hook (as it runs from `useRiverValidator()`).

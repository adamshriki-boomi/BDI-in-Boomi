# River Logic View

the default view for river logic is tree view.

There are few key components that are used to render the tree. the tree is a recursion render of TreeNode component which includes these:

```
> TreeNode
  - NodeHeader
  - LogicStep | LogicContainer
```

Each component is composed of several components - the view is depended on the data of each node (step).

## River Draft Hooks

these hooks are the api for interacting (edit actions) with the store's current draft. It can be used anywhere down the tree and for the most part, requires a step's hash in order to update the correct step within the draft

- useStepActions
- useStepContentForm

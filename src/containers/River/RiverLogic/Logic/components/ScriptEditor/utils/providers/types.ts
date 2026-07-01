import { CancellationToken, editor, languages, Position } from 'monaco-editor';

export type LanguagesList = string | string[];

export type disposeFN = () => void;

export type DrilldownResult = {
  currentRoot: NestedCompletionConfig | undefined;
  value: any[];
  partialMatch?: boolean;
};

export type labelFnOrBool =
  | ((item: string | NestedCompletionConfig) => string | undefined)
  | boolean;

export type NestedCompletionConfig = {
  name: string;
  itemsType?: string;
  itemsKind?: languages.CompletionItemKind;
  items?: NestedCompletionConfig[];
  toDetails?: labelFnOrBool;
  toDocumentation?: labelFnOrBool;
  toContents?: (value: string) => any[] | undefined;
  toInsertText?: labelFnOrBool;
};

export type provideCompletionItemsFN = (
  model: editor.ITextModel,
  position: Position,
  context?: languages.CompletionContext,
  token?: CancellationToken,
) => languages.ProviderResult<languages.CompletionList> | undefined;

export type provideHoverFN = (
  model: editor.ITextModel,
  position: Position,
  token?: CancellationToken,
) => languages.ProviderResult<languages.Hover> | undefined;

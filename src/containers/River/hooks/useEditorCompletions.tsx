import { useMemo } from 'react';
import { createBigNested } from '../RiverLogic/Logic/components/ScriptEditor/utils/providers/big';
import {
  useDataframeCompletionProvider,
  useRiverHoverProvider,
  useRiverTokensProvider,
  useTokensProvider,
  useVariablesCompletionProvider,
} from '../RiverLogic/Logic/components/ScriptEditor/utils/providers/custom';
import {
  useCompletionProvider,
  useCreateNestedCompletionProvider,
  useCreateNestedHoverProvider,
  useHoverProvider,
} from '../RiverLogic/Logic/components/ScriptEditor/utils/providers/hooks';

const defualtLanguages = ['python', 'sql'];

export function useEditorCompletions(riverName) {
  useCompletionProvider(useDataframeCompletionProvider(), 'python');
  useCompletionProvider(useVariablesCompletionProvider(), defualtLanguages, [
    '.',
  ]);
  const dbgCfg = useMemo(
    () =>
      riverName?.match(/_dbg_/i) ? createBigNested('ry_dbg', 2, 6) : undefined,
    [riverName],
  );

  useCompletionProvider(
    useCreateNestedCompletionProvider(dbgCfg),
    defualtLanguages,
    ['.'],
  );
  useHoverProvider(useCreateNestedHoverProvider(dbgCfg), defualtLanguages);

  const hoverProvider = useRiverHoverProvider();
  useHoverProvider(hoverProvider, defualtLanguages);
  const tokensProvider = useRiverTokensProvider();
  useTokensProvider(tokensProvider, defualtLanguages);
}

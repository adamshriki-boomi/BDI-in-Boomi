import { useMonaco } from '@monaco-editor/react';
import { useGetDataframesQuery } from 'modules/DataFrames';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { useRiver } from 'store/river';
import { compare, pluck } from 'utils/array.utils';
import {
  useCreateNestedCompletionProvider,
  useCreateNestedHoverProvider,
} from './hooks';

type LangsList = string | string[];
const emptyLangs: LangsList = [''];
const emptyArray = [];

function extendTheme(theme) {
  return {
    base: theme,
    inherit: true,
    rules: [
      {
        foreground: '#800080',
        token: 'rivery-variable',
        fontStyle: 'bold',
      },
      {
        foreground: '#800080',
        token: 'rivery-local-variable',
        fontStyle: 'bold',
      },
      {
        foreground: '#800080',
        token: 'rivery-dataframe',
        fontStyle: 'bold',
      },
    ],
    colors: {},
    // colors: {
    //   // 'editor.foreground': '#D0D0FF',
    //   // 'editor.background': '#200020',
    //   // 'editor.selectionBackground': '#80000080',
    //   // 'editor.lineHighlightBackground': '#80000040',
    //   // 'editorCursor.foreground': '#7070FF',
    //   // 'editorWhitespace.foreground': '#BFBFBF',
    // },
  };
}

export function useEditorThemeEnhancer(theme = 'vs') {
  const editor = useMonaco()?.editor;

  useEffect(() => {
    if (editor) {
      editor.defineTheme('vs-rivery', extendTheme(theme));
      editor.setTheme('vs-rivery');
    }
  }, [editor, theme]);
}

const riveryLegend = {
  tokenTypes: ['rivery-variable', 'rivery-local-variable', 'rivery-dataframe'],
  tokenModifiers: [],
  // tokenModifiers: [
  //   'declaration',
  //   'documentation',
  //   'readonly',
  //   'static',
  //   'abstract',
  //   'deprecated',
  //   'modification',
  //   'async',
  // ],
};

export function useTokensProvider(
  provideDocumentRangeSemanticTokens,
  languagesToRegister: LangsList = emptyLangs,
) {
  const languages = useMonaco()?.languages;
  useEffect(() => {
    if (!languages || !provideDocumentRangeSemanticTokens) return;

    const disposables = [languagesToRegister].flat().map(language =>
      languages.registerDocumentRangeSemanticTokensProvider(language, {
        provideDocumentRangeSemanticTokens,
        getLegend: () => riveryLegend,
      }),
    );

    return () => {
      disposables.forEach(d => d?.dispose?.());
    };
  }, [languages, provideDocumentRangeSemanticTokens, languagesToRegister]);
}

export function useRiverTokensProvider() {
  const { data: dataframes } = useGetDataframesQuery();
  const { selectedVariables } = useRiver();
  const { selectedEnv } = useSelectedEnvironment();
  const selectedEnvVariables = selectedEnv?.variables;
  const labelsInfo = useMemo(() => {
    return [
      dataframes?.map(({ name }) => name && { name, type: 2 }),
      Object.keys(selectedVariables || {}).map(name => ({ name, type: 1 })),
      Object.keys(selectedEnvVariables || {}).map(name => ({
        name,
        type: 0,
      })),
    ]
      .filter(Boolean)
      .flat();
  }, [dataframes, selectedVariables, selectedEnvVariables]);

  return useCallback(
    (model, range) => {
      const labels = labelsInfo.map(pluck('name')).join('|') + '|miro';
      const labelsStr = `(?<!-)\\b(${labels})\\b(?!-)`;
      const groupLabelsStr = `(?<!-)\\b(?<token>${labels})\\b(?!-)`;
      const regExStr = `(?<head>[^]*?(^|[^-])(?=(${labelsStr})))${groupLabelsStr}`;
      const tokensRegEx = new RegExp(regExStr, 'g');

      const tokens = [
        ...model.getValueInRange(range).matchAll(tokensRegEx),
      ].map(({ groups: { head, token } }, index, values) => {
        const lines =
          (head.match(/\r?\n/g)?.length || 0) +
          (!index && range.startLineNumber - 1);
        return [
          lines,
          lines
            ? head.match(/[\r\n]+(?<tail>.*$)/)?.groups?.tail?.length ?? 0
            : head.length +
              (index && (values[index - 1]?.groups?.token?.length ?? 0)),
          token.length,
          labelsInfo.find(compare('name', token))?.type ?? 0,
          0,
        ];
      });

      return {
        data: new Uint32Array(tokens.flat()),
        resultId: null,
      };
    },
    [labelsInfo],
  );
}

export function useRiverHoverProvider() {
  const dataframesCfg = useDataframesConfig();
  const varCfg = useVariablesConfig();

  const config = useMemo(
    () => [dataframesCfg, varCfg].flat(),
    [dataframesCfg, varCfg],
  );
  return useCreateNestedHoverProvider(config);
}

function useDataframesConfig() {
  const { data: dataframes } = useGetDataframesQuery();
  const languages = useMonaco()?.languages;

  return useMemo(() => {
    return (
      languages && {
        name: 'dataframes',
        itemsType: 'DataFrame',
        itemsKind: languages.CompletionItemKind.Reference,
        items: dataframes?.map(({ name }) => ({ name: name })),
        toDetails: true,
        toDocumentation: ({ name }) => `Rivery dataframe ${name}`,
        toContents: value => [
          { value: `![rivery logo](/logo-64.png|width=16) *${value}*` },
        ],
        // return [
        //   // {
        //   //   value: `[![rivery logo](/logo-64.png|width=24)  Rivery DataFrame](https://help.boomi.com/docs/Atomsphere/Data_Integration/Rivers/LogicRiver/LogicSteps/Python/)"`,
        //   // },
        //   // ...contents,
        // ];
        // },
      }
    );
  }, [languages, dataframes]);
}
export function useDataframeCompletionProvider() {
  return useCreateNestedCompletionProvider(useDataframesConfig());
}

function useVariablesConfig() {
  const { selectedVariables } = useRiver();
  const { selectedEnv } = useSelectedEnvironment();
  const selectedEnvVariables = selectedEnv?.variables;
  const languages = useMonaco()?.languages;
  return useMemo(() => {
    return languages
      ? [
          selectedVariables && {
            name: 'local variables',
            itemsType: 'Data Flow variable',
            itemsKind: languages.CompletionItemKind.Module,
            items: Object.keys(selectedVariables).map(name => ({ name })),
            toDetails: true,
            toInsertText: name => name,
            // toContents: contents => [
            // {
            //   value: `[![rivery logo](/logo-64.png|width=24) Rivery local variable](https://help.boomi.com/docs/Atomsphere/Data_Integration/GettingStarted/variables)`,
            // },
            // ...contents,
            toContents: value => [
              { value: `![rivery logo](/logo-64.png|width=16) *${value}*` },
            ],
          },
          selectedEnvVariables && {
            name: 'env variables',
            itemsType: 'Environment variable',
            itemsKind: languages.CompletionItemKind.Module,
            items: Object.keys(selectedEnvVariables).map(name => ({ name })),
            toDetails: true, // name => `[Environment variable] ${name}`,
            toInsertText: name => name,
            toDocumentation: ({ name }) =>
              `Boomi Data Integration env variable ${name}`,
            toContents: value => [
              { value: `![rivery logo](/logo-64.png|width=16) *${value}*` },
            ],
            // toContents: contents => [
            //   {
            //     value: `[![rivery logo](/logo-64.png|width=24) Rivery env variable](https://help.boomi.com/docs/Atomsphere/Data_Integration/GettingStarted/variables)`,
            //   },
            //   { value: '*Info*' },
            //   ...contents,
            // ],
          },
        ].filter(Boolean)
      : emptyArray;
  }, [languages, selectedVariables, selectedEnvVariables]);
}
export function useVariablesCompletionProvider() {
  return useCreateNestedCompletionProvider(useVariablesConfig());
}

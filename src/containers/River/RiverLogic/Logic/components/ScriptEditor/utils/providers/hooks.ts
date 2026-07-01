// import * as monaco from 'monaco-editor';
import { useMonaco } from '@monaco-editor/react';
import { useCallback, useEffect, useMemo } from 'react';
import {
  DrilldownResult,
  labelFnOrBool,
  LanguagesList,
  NestedCompletionConfig,
  provideCompletionItemsFN,
  provideHoverFN,
} from './types';
export * from './types';

const emptyLangs: LanguagesList = [''];
const emptyArray = [];

export function useCompletionProvider(
  provideCompletionItems: provideCompletionItemsFN,
  languagesList: LanguagesList = emptyLangs,
  triggerCharacters: string[] | undefined = undefined,
) {
  const languages = useMonaco()?.languages;
  useEffect(() => {
    if (!languages) return;

    const disposables = [languagesList].flat().map(language =>
      languages.registerCompletionItemProvider(language, {
        provideCompletionItems,
        triggerCharacters,
      }),
    );

    return () => {
      disposables.forEach(d => d?.dispose?.());
    };
  }, [provideCompletionItems, languagesList, triggerCharacters, languages]);
}

export function useCreateNestedCompletionProvider(
  config: NestedCompletionConfig | NestedCompletionConfig[],
): provideCompletionItemsFN {
  const flatConfig = useMemo(() => [config].flat().filter(Boolean), [config]);

  const languages = useMonaco()?.languages;
  return useCallback(
    (model, position) => {
      if (!(languages && flatConfig?.length)) {
        return {
          suggestions: emptyArray,
        };
      }
      const range = getWordRange(model, position);
      // drilldown
      const matchText = model.getValueInRange(
        getNestedWordRange(model, position),
      );

      const matches: (DrilldownResult | undefined)[] = findNestedMatch(
        flatConfig,
        matchText,
      );

      const suggestions =
        matches
          ?.map(match => {
            const nestedMatch = match?.value;
            if (nestedMatch?.length) {
              const {
                toDetails = false,
                toDocumentation = false,
                toInsertText = false,
              } = nestedMatch[0];

              const lastItem = nestedMatch[nestedMatch.length - 1];
              const itemsKind =
                lastItem.itemsKind ?? languages.CompletionItemKind.Property;

              const suggestions =
                lastItem?.items
                  ?.map((item: NestedCompletionConfig) => {
                    const docFN = item?.toDocumentation ?? toDocumentation;
                    const documentation =
                      typeof docFN === 'function'
                        ? docFN(item)
                        : docFN
                        ? item.name
                        : undefined;
                    return {
                      label: item.name,
                      kind: itemsKind,
                      detail: getNestedLabel(
                        item.name,
                        nestedMatch,
                        lastItem?.toDetails ?? toDetails,
                      ),
                      documentation,
                      insertText:
                        getLabel(
                          item.name,
                          item?.toInsertText ?? toInsertText,
                        ) || '',
                      // insertTextRules:
                      //   monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      range,
                    };
                  })
                  .flat() ?? [];
              return suggestions;
            } else {
              return undefined;
            }
          })
          .filter(Boolean)
          .flat() ?? emptyArray;
      return {
        suggestions,
      };
    },
    [flatConfig, languages],
  );
}

export function useHoverProvider(
  provideHover: provideHoverFN,
  languagesList: LanguagesList = emptyLangs,
) {
  const languages = useMonaco()?.languages;
  useEffect(() => {
    if (!languages) return;

    const disposables = [languagesList].flat().map(language =>
      languages.registerHoverProvider(language, {
        provideHover,
      }),
    );

    return () => {
      disposables.forEach(d => d?.dispose?.());
    };
  }, [languages, provideHover, languagesList]);
}

export function useCreateNestedHoverProvider(
  config: NestedCompletionConfig | NestedCompletionConfig[] = emptyArray,
) {
  return useCallback(
    (model, position) => {
      const flatConfig = [config].flat().filter(Boolean);
      const fullTextRange = getNestedWordRange(model, position, true);
      const matchText = model.getValueInRange(fullTextRange);
      const tail = matchText.match(/\.?(?<tail>[^.]+)$/)?.groups?.tail;
      const matches = matchText && findNestedMatch(flatConfig, matchText);
      const nestedMatch = matches?.find(({ value }) => {
        const lastItem = value[value.length - 1];
        return lastItem?.items.find(({ name }) => name === tail);
      })?.value;
      if (nestedMatch?.length) {
        const label = getNestedLabel(
          matchText?.split('.').pop() ?? '',
          nestedMatch,
          true,
        );
        if (label) {
          const contents = (
            nestedMatch[0].toContents ||
            nestedMatch[nestedMatch.length - 1].toContents ||
            ((v: any[]): any[] => v)
          )?.(label);
          return {
            range: getWordRange(model, position),
            contents,
          };
        }
      }
    },
    [config],
  );
}

function getLabel(item: string, fn: labelFnOrBool) {
  if (fn) {
    if (typeof fn === 'function') {
      return fn(item);
    } else {
      return item;
    }
  }
  return item;
}

function getNestedLabel(
  item: string,
  match: NestedCompletionConfig[],
  fn: labelFnOrBool,
) {
  if (
    match.length === 1 &&
    !match?.[0]?.items?.find(({ name }) => name === item)
  ) {
    return;
  }

  const prefix = match.length > 1 ? ' inside ' : '';

  const content =
    match.length > 1
      ? match
          .map(({ name, itemsType }, index) => {
            if (index) {
              if (index === match.length - 1) {
                return name;
              } else {
                return `${name} > [${itemsType ?? 'no type'}]`;
              }
            } else {
              return `[${itemsType ?? 'no type'}]`;
            }
          })
          .join(' ')
      : '';

  const lastMatch = match[match.length - 1];
  const result = `${item} [${lastMatch.itemsType}]${prefix}${content}`;
  return typeof fn === 'function' ? fn(result) : fn && result;
}

function getWordRange(model, position) {
  const word = model.getWordUntilPosition(position);
  return {
    startLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endLineNumber: position.lineNumber,
    endColumn: word.endColumn,
  };
}

function getNestedWordRange(model, position, extendToWordEnd: boolean = false) {
  const prevTokenMatch = model.findPreviousMatch(
    '(?<=[^\\S.-]|\\{|^)',
    position,
    true,
    false,
    null,
    false,
  );
  const nextTokenMatch = extendToWordEnd
    ? model.findNextMatch(
        '(?=[\\s.]|\\}|$)',
        position,
        true,
        false,
        null,
        false,
      )
    : null;

  const endColumn = nextTokenMatch?.range
    ? nextTokenMatch.range.startLineNumber === position.lineNumber
      ? nextTokenMatch.range.endColumn
      : model.getLineLength(position.lineNumber) + 1
    : position.column;
  const startColumn =
    prevTokenMatch &&
    prevTokenMatch.range.startLineNumber === position.lineNumber
      ? prevTokenMatch.range.endColumn
      : 1;

  return {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn,
    endColumn,
  };
}

function findNestedMatch(
  config: NestedCompletionConfig | NestedCompletionConfig[],
  text: string,
  delimiter: string = '.',
) {
  if (!(config && text && delimiter)) {
    return undefined;
  }
  const flatConfig = [config].flat();
  const parts = text.split(delimiter).filter(Boolean);

  const results = flatConfig.map(config => {
    const initValue: DrilldownResult = {
      value: [config],
      currentRoot: config,
      partialMatch: false,
    };

    const baseResult = parts.reduce(({ value, currentRoot }, part) => {
      if (currentRoot) {
        const nextRoot = currentRoot?.items?.find(({ name }) => name === part);
        if (nextRoot) {
          if (nextRoot?.items?.length) {
            return { value: [...value, nextRoot], currentRoot: nextRoot };
          } else {
            return {
              value: text.endsWith('.') ? emptyArray : value,
              currentRoot: null,
            };
          }
        }
        return {
          value: text.endsWith('.') ? emptyArray : value,
          currentRoot: null,
          partialMatch: true,
        };
      } else {
        return { value: emptyArray, currentRoot: null };
      }
    }, initValue);
    if (
      !baseResult.partialMatch &&
      baseResult.value.length > 1 &&
      !text.endsWith('.')
    ) {
      const lastSegment = baseResult.value[baseResult.value.length - 1];
      const lastPart = parts[parts.length - 1];
      if (
        !lastSegment?.items?.some(
          ({ name }: { name: string }) => name === lastPart,
        )
      ) {
        baseResult.value.pop();
      }
    }
    return baseResult;
  });
  return results;
}

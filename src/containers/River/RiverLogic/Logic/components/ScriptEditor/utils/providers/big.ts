import * as monaco from 'monaco-editor';
import { NestedCompletionConfig } from './types';

// const emptyArr = [];

const dbgHelpers = {
  // toContents: (value: string) => {
  //   return [
  //     { value: '**Rivery info**' },
  //     { value: '*Rivery sub info*' },
  //     { value },
  //   ];
  // },
  toContents: (value: string) => [{ value }],
  toDocumentation: (v: string | NestedCompletionConfig) => {
    const cfg: NestedCompletionConfig = v as NestedCompletionConfig;
    const title = [`[${cfg?.itemsType ?? 'fields'}]`];
    if (cfg && cfg?.items?.length) {
      return title
        .concat(cfg.items.map(({ name }: { name: string }) => `* ${name}`))
        .join('\n');
    } else {
      return undefined;
    }
  },
};

// Meir - FIXME: remove this file, it is here just
// as a demo for @limor-rivery before we get real data from the API
type ItemConfig = {
  itemsType: string;
  itemsKind: monaco.languages.CompletionItemKind;
};

const config: ItemConfig[] = [
  {
    itemsType: 'operator',
    itemsKind: monaco.languages.CompletionItemKind.Operator,
  },
  {
    itemsType: 'field',
    itemsKind: monaco.languages.CompletionItemKind.Field,
  },
  {
    itemsType: 'table',
    itemsKind: monaco.languages.CompletionItemKind.Struct,
  },
  {
    itemsType: 'schema',
    itemsKind: monaco.languages.CompletionItemKind.Keyword,
  },
  {
    itemsType: 'database',
    itemsKind: monaco.languages.CompletionItemKind.Module,
  },
  {
    itemsType: 'connection',
    itemsKind: monaco.languages.CompletionItemKind.Unit,
  },
];

function generate(
  baseName: string,
  types: ItemConfig[],
  minLen: number,
  maxLen: number,
): any | undefined {
  if (types.length) {
    const { itemsType, itemsKind } = types.pop() as ItemConfig;
    const subItemsType = types[types.length - 1]?.itemsType ?? 'un-typed-items';
    const length = Math.round(Math.random() * (maxLen - minLen) + minLen);
    return Array.from({ length }, (_, idx) => {
      const name = `${baseName}__${itemsType}_${idx}`;
      return {
        name,
        itemsType: subItemsType,
        itemsKind,
        items: generate(`${baseName}_${idx}`, [...types], minLen, maxLen),
      };
    });
  }
}

export function createBigNested(
  baseName: string,
  minLen: number = 2,
  maxLen: number = 6,
) {
  return {
    name: 'root',
    itemsType: 'connection',
    items: generate(baseName, config, minLen, maxLen),
    ...dbgHelpers,
  };
}

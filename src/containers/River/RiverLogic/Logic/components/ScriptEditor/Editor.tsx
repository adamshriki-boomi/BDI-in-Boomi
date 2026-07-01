import { Box } from 'components';
import * as monaco from 'monaco-editor';
import React, { useCallback, useEffect, useState } from 'react';

export type EditorProps = {
  value?: string;
  language?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  lineNumbersMinChars?: number;
  path?: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
};

const defaultEditorOptions = {
  lineDecorationsWidth: 0,
  minimap: { enabled: false },
  hideCursorInOverviewRuler: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
  overviewRulerBorder: false,
  'semanticHighlighting.enabled': true,
};

function composeDispose(disposables: monaco.IDisposable[]) {
  return () => {
    disposables.forEach(d => d.dispose());
  };
}

export function Editor({
  value = '',
  language,
  onChange,
  onFocus,
  onBlur,
  readOnly,
  theme,
  path = '',
  lineNumbersMinChars,
  options,
}: EditorProps) {
  const [subscriptions] = useState<Map<Node, () => void>>(new Map());
  const [, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  useEffect(() => {
    return () => {
      subscriptions.forEach(subscription => subscription());
      subscriptions.clear();
    };
  }, [subscriptions]);

  useEffect(() => {
    if (path) {
      const model = monaco.editor.getModel(monaco.Uri.parse(path));
      if (model) {
        if (model.getValue() !== value) {
          model.setValue(value);
        }
      } else {
        setEditor(editorInstance => {
          if (editorInstance) {
            editorInstance.setModel(
              monaco.editor.createModel(
                value,
                language,
                monaco.Uri.parse(path),
              ),
            );
          }
          return editorInstance;
        });
      }
    }
  }, [path, value, language]);

  // useEffect(() => {
  //   return () => {
  //     const model = monaco.editor.getModel(monaco.Uri.parse(path));
  //     if (model) {
  //       model.dispose();
  //     }
  //   };
  // }, [path]);

  const register = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        if (path) {
          if (subscriptions.has(el)) {
            return;
          }
          const model =
            monaco.editor.getModel(monaco.Uri.parse(path)) ??
            monaco.editor.createModel('', language, monaco.Uri.parse(path));
          setTimeout(() => {
            const editorInstance = monaco.editor.create(el, {
              language,
              theme,
              readOnly,
              model,
              lineNumbersMinChars,
              renderLineHighlight: 'none',
              ...defaultEditorOptions,
              ...options,
            });
            setEditor(editorInstance);
            if (onChange) {
              if (!subscriptions.has(el)) {
                const dispose = composeDispose(
                  [
                    editorInstance.onDidChangeModelContent(() => {
                      onChange(editorInstance.getValue());
                    }),
                    onFocus && editorInstance.onDidFocusEditorText(onFocus),
                    onBlur && editorInstance.onDidBlurEditorText(onBlur),
                  ].filter(Boolean) as monaco.IDisposable[],
                );
                subscriptions.set(el, dispose);
              }
            }
          }, 0);
        }
      }
    },
    [
      language,
      onChange,
      onFocus,
      onBlur,
      path,
      readOnly,
      theme,
      lineNumbersMinChars,
      options,
      subscriptions,
    ],
  );

  return <Box h="full" w="full" ref={register} />;
}

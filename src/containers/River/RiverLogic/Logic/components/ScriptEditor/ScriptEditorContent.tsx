import { Box, ChakraStyledOptions } from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import debounce from 'debounce';
import React, { useMemo, useState } from 'react';

export const voidFn = () => void 0;

export function createEditorHeightHandler(
  editor,
  lineHeight,
  setHeight,
  maxLines,
  minLines,
) {
  return ({ contentHeightChanged }) => {
    if (contentHeightChanged) {
      const contentLines = editor.getModel().getLineCount();
      const displayLines =
        minLines > contentLines
          ? minLines
          : maxLines < 0
          ? contentLines
          : Math.min(contentLines, maxLines);
      setHeight(Math.ceil((displayLines + 0.5) * lineHeight));
    }
  };
}

function sanitizePath(path: string): string {
  if (!path) return path;

  return path
    .replace(/:/g, '_') // Replace colons with underscores
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[<>:"\\|?*]/g, '_') // Replace other invalid URI characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .toLowerCase();
}

export interface ScriptEditorContentProps {
  path?: string;
  value: any;
  language: string;
  title?: React.ReactNode;
  fileName?: string;
  // theme?: string;
  maxLines?: number;
  autoHeight?: boolean;
  minLines?: number;
  onChange?: (value: string) => any;
  readOnly?: boolean;
  styleProps?: ChakraStyledOptions;
  ariaLabel?: any;
  setEditorRef?: (editor, monaco) => void;
}

export function ScriptEditorContent({
  path = undefined,
  value = '',
  language = 'json',
  // theme = 'light',
  maxLines = 4,
  minLines = 3,
  autoHeight = false,
  onChange,
  readOnly = false,
  styleProps,
  ariaLabel = 'editor',
  setEditorRef = null,
}: ScriptEditorContentProps) {
  const [height, setHeight] = useState<number | string>(
    autoHeight ? 'auto' : 0,
  );
  const debouncedOnChange = useMemo(
    () => (readOnly ? voidFn : debounce(onChange, 300)),
    [onChange, readOnly],
  );

  const lineDigits = useMemo(
    () => toDigitsCount((value?.match(/\n/gi)?.length ?? 0) + 1) + 2,
    [value],
  );
  const sanitizedPath = path ? sanitizePath(path) : undefined;

  return (
    <Box aria-label={ariaLabel} h={height} overflow="hidden" {...styleProps}>
      <Editor
        onMount={(editor, monaco) => {
          setEditorRef && setEditorRef(editor, monaco);
          if (autoHeight) {
            return;
          } else {
            const updateHeight = createEditorHeightHandler(
              editor,
              editor.getOption(monaco.editor.EditorOption.lineHeight),
              setHeight,
              maxLines,
              minLines,
            );
            editor.onDidContentSizeChange(updateHeight);
            updateHeight({ contentHeightChanged: true });
          }
        }}
        options={{
          readOnly,
          lineDecorationsWidth: 0,
          minimap: {
            enabled: false,
          },
          renderLineHighlight: 'none',
          scrollBeyondLastLine: false,
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
          lineNumbersMinChars: lineDigits,
          overviewRulerBorder: false,
          'semanticHighlighting.enabled': true,
        }}
        theme="vs-rivery"
        path={sanitizedPath}
        language={language}
        value={value}
        onChange={debouncedOnChange}
      />
    </Box>
  );
}

function toDigitsCount(numValue) {
  return Math.ceil(Math.log10(Math.abs(numValue) + 1)) + (numValue < 0 ? 1 : 0);
}

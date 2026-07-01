import { InputGroup } from '@chakra-ui/react';
import { Box, CloseIconSmall, Flex, Grid, Icon } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { ScriptEditorContent } from 'containers/River/RiverLogic/Logic/components/ScriptEditor';
import { CodeEditorProps } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/CodeEditor';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ValidateYaml from './ValidateYaml';

const YamlEditor = React.memo(CodeEditor);

function SearchInEditor({ editorRef, monacoRef }) {
  const {
    decorations,
    searchTerm,
    handleSearch,
    resultIndex,
    setCurrentResultIndex,
  } = useSearchInEditor(editorRef, monacoRef);
  return (
    <InputGroup>
      <Input
        size="md"
        chakra
        placeholder="Search..."
        onChange={handleSearch}
        value={searchTerm}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            scrollToHighlightedText(
              decorations,
              editorRef.current,
              resultIndex + 1,
            );
            setCurrentResultIndex(resultIndex + 1);
          }
        }}
      />
    </InputGroup>
  );
}

const useSearchInEditor = (editorRef, monacoRef) => {
  const [searchTerm, setSearchterm] = useState('');
  const [resultIndex, setCurrentResultIndex] = useState(0);
  const handleSearch = useCallback(({ target: { value } }) => {
    setSearchterm(value);
  }, []);

  const { setUpDecorations, decorations } =
    useSetDecorationsToEditor(searchTerm);
  useEffect(() => {
    setUpDecorations(editorRef?.current, monacoRef?.current, [resultIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, resultIndex]);

  useEffect(() => {
    // Reset the result index when the search term changes
    if (resultIndex > 0) {
      setCurrentResultIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return {
    decorations,
    searchTerm,
    handleSearch,
    resultIndex,
    setCurrentResultIndex,
  };
};

export function Editor({ s2t }) {
  const formApi = useFormContext();

  const editorRef = React.useRef(null);
  const monacoRef = React.useRef(null);
  const setEditorRef = useCallback((editor, monaco) => {
    if (editor && monaco) {
      editorRef.current = editor;
      monacoRef.current = monaco;
    }
  }, []);

  return (
    <Flex
      w="calc(100vw - 700px)"
      minW="800px"
      gap={3}
      flexDir="column"
      bg="white"
      px={4}
      pt={6}
    >
      <Grid
        gap={2}
        w="full"
        templateColumns="300px max-content max-content 1fr"
      >
        <SearchInEditor editorRef={editorRef} monacoRef={monacoRef} />
        <RiveryButton
          label="Clear"
          variant="default"
          onClick={() => formApi?.setValue('yaml', '', { shouldDirty: true })}
          leftIcon={<Icon as={CloseIconSmall} boxSize={4} />}
        />
        <ValidateYaml field={formApi?.watch('yaml')} />
      </Grid>
      <MonacoYamlEditor setEditorRef={setEditorRef} />
    </Flex>
  );
}

export function MonacoYamlEditor({ setEditorRef }) {
  const formApi = useFormContext();
  const setValue = useCallback(
    val => formApi.setValue('yaml', val, { shouldDirty: true }),
    [formApi],
  );
  return (
    <>
      <YamlEditor
        setEditorRef={setEditorRef}
        styleProps={{
          height: 'calc(100vh - 250px)',
        }}
        value={formApi?.watch('yaml')}
        type="Yaml"
        language="yaml"
        onChange={setValue}
        titleModal={''}
        fileName={''}
        hash={''}
      />
    </>
  );
}

function CodeEditor({
  footer,
  contentLoader,
  isLoadingContent,
  fileName,
  type,
  titleModal,
  titleOverlay = null,
  onContentChange,
  styleProps,
  ...props
}: CodeEditorProps) {
  const { title } = props;
  return (
    <Box {...styleProps}>
      <Grid
        borderBottom={0}
        my={0}
        py={1}
        px={2}
        gap={1}
        gridTemplateColumns="1fr max-content"
        alignItems="center"
      >
        {title}
      </Grid>
      <ScriptEditorContent
        ariaLabel="code editor"
        styleProps={{
          height: '100%',
        }}
        {...props}
        onChange={onContentChange || props.onChange}
      />
    </Box>
  );
}

function scrollToHighlightedText(decorations, editor, index) {
  if (decorations?.length > 0 && index >= 0 && index < decorations?.length) {
    const currDecoration = decorations[index];
    const position = {
      lineNumber: currDecoration.range.startLineNumber,
      column: currDecoration.range.startColumn,
    };

    editor.revealPositionInCenter(position);
  }
}

const useSetDecorationsToEditor = searchTerm => {
  const [editorDecorations, setEditorDecorations] = useState(null);
  const setUpDecorations = useCallback(
    (editor, monaco, positionToHighlight) => {
      const model = editor?.getModel();
      const matches = model?.findMatches(
        searchTerm,
        true,
        false,
        false,
        null,
        true,
      );
      const decorations =
        matches &&
        matches
          .filter((match, index) => positionToHighlight?.includes(index))
          .map(match => ({
            range: new monaco.Range(
              match.range.startLineNumber,
              match.range.startColumn,
              match.range.endLineNumber,
              match.range.endColumn,
            ),
            options: {
              inlineClassName: 'highlighted-text',
            },
          }));

      const oldDecorations = editor?.decorations || [];
      if (editor) {
        editor.decorations = editor?.deltaDecorations(
          oldDecorations,
          decorations,
        );
        setEditorDecorations(decorations);
      }
      scrollToHighlightedText(decorations, editor, 0);
    },
    [searchTerm],
  );
  return { setUpDecorations, decorations: editorDecorations };
};

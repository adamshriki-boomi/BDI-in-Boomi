import { ChakraStyledOptions, Skeleton } from '@chakra-ui/react';
import { Box, Flex, GridBox } from 'components';
import { InvalidFeedback } from 'components/Form';
import { normalizeFileName } from 'containers/River/RiverLogic/Logic/components/BlockPython';
import React, { ReactNode, useEffect, useState } from 'react';
import {
  ScriptEditorContent,
  ScriptEditorContentProps,
  ScriptEditorModal,
} from '.';
import { DownloadScriptButton } from './DownloadScriptButton';

export interface CodeEditorProps extends ScriptEditorContentProps {
  controls?: ReactNode;
  footer?: ReactNode;
  titleModal: ReactNode;
  titleOverlay?: ReactNode;
  fileName: string;
  type: string;
  enableRun?: boolean;
  hash: string;
  invalid?: boolean;
  contentLoader?: ReactNode;
  isLoadingContent?: boolean;
  styleProps?: ChakraStyledOptions;
  onContentChange?: (value: string) => any;
}
export function CodeEditor({
  controls,
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
  const { title, enableRun, value, hash } = props;
  const fileNameNormalized = normalizeFileName(fileName);
  const isInvalid = props?.invalid;

  return (
    <Box {...styleProps}>
      <GridBox
        border="1px solid"
        borderColor="gray.300"
        borderBottom={0}
        my={0}
        py={1}
        px={2}
        gap={1}
        gridTemplateColumns="1fr max-content"
        alignItems="center"
      >
        {title}
        <Flex alignItems="center" gap={1}>
          {controls}
          <DownloadScriptButton
            fileName={fileNameNormalized}
            script={value}
            type={type}
          />
          <ScriptEditorModal
            {...props}
            title={titleModal}
            enableRun={enableRun}
            fileName={fileNameNormalized}
            titleOverlay={titleOverlay}
            hash={hash}
            type={type}
            buttonVariant="text-link"
          />
        </Flex>
      </GridBox>
      {isLoadingContent ? (
        contentLoader
      ) : (
        <RenderDelay>
          <ScriptEditorContent
            ariaLabel="code editor"
            styleProps={{
              border: '1px',
              borderColor: isInvalid ? 'error' : 'gray.400',
            }}
            {...props}
            onChange={onContentChange || props.onChange}
          />
        </RenderDelay>
      )}
      {isInvalid ? (
        <InvalidFeedback.Wrapper>
          <InvalidFeedback message="This field is required" />
        </InvalidFeedback.Wrapper>
      ) : null}
      {footer}
    </Box>
  );
}

function RenderDelay({ children }) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  if (loading) {
    return <Skeleton height="99px" w="full"></Skeleton>;
  }

  return children;
}

import { ChakraStyledOptions, Skeleton } from '@chakra-ui/react';
import { Box, Flex, GridBox, Text } from 'components';
import { InvalidFeedback } from 'components/Form';
import { DownloadScriptButton } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/DownloadScriptButton';
import {
  ScriptEditorContent,
  ScriptEditorContentProps,
} from 'containers/River/RiverLogic/Logic/components/ScriptEditor/ScriptEditorContent';
import React, { ReactNode, useEffect, useState } from 'react';
import { CustomQueryModal } from './CustomQueryModal';

function normalizeFileName(fileName: string, replaceWith = '_') {
  return fileName.replace(/[-[/\]{}()*+?,\\^$|#\s]/g, replaceWith);
}

export interface CustomQueryCodeEditorProps extends ScriptEditorContentProps {
  controls?: ReactNode;
  footer?: ReactNode;
  titleModal: ReactNode;
  titleOverlay?: ReactNode;
  fileName: string;
  type: string;
  invalid?: boolean;
  contentLoader?: ReactNode;
  isLoadingContent?: boolean;
  styleProps?: ChakraStyledOptions;
  onContentChange?: (value: string) => void;
  warningMessage?: string;
}

/**
 * Code editor component for Custom Query.
 * Similar to CodeEditor but uses CustomQueryModal instead of ScriptEditorModal
 * to avoid Logic river-specific dependencies.
 */
export function CustomQueryCodeEditor({
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
  warningMessage,
  ...props
}: CustomQueryCodeEditorProps) {
  const { title, value } = props;
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
        <Flex alignItems="center" gap={2}>
          {warningMessage ? (
            <Text color="font-danger" textStyle="R7">
              {warningMessage}
            </Text>
          ) : null}
          {controls}
          <DownloadScriptButton
            fileName={fileNameNormalized}
            script={value}
            type={type}
          />
          <CustomQueryModal
            {...props}
            title={titleModal}
            fileName={fileNameNormalized}
            titleOverlay={titleOverlay}
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
            ariaLabel="custom query code editor"
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

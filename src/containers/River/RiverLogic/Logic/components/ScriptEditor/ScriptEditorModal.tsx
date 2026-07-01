import { Flex, Icon } from '@chakra-ui/react';
import { RiveryModal } from 'components';
import { TooltipIconButton } from 'components/Buttons/RiveryButton';
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { FaExpandAlt } from 'react-icons/fa';
import { useToggle } from 'react-use';
import { useRiver } from 'store/river';
import { DownloadScriptButton } from './DownloadScriptButton';
import { EditorLayout } from './EditorLayout';
import { ScriptEditorContentProps } from './ScriptEditorContent';

export const scriptModalProps = {
  isCentered: true,
  size: 'xl',
  mx: 6,
};

export type ScriptEditorModalProps = ScriptEditorContentProps & {
  children?: ReactElement;
  buttonVariant?: string;
  title?: ReactNode;
  titleAs?: string;
  titleOverlay?: ReactNode;
  titleWeight?: string;
  enableRun?: boolean;
  /**
   * Logic Step hash_key_init
   */
  hash: string;
  isExecute?: boolean;
  type: string;
};

/**
 * renders a button that toggles a script editor dialog
 * @param children - used as an icon for the toggle button
 * @example
 * <ScriptEditorModal>
 *  <MdCircle />
 * </ScriptEditorModal>
 */
export function ScriptEditorModal({
  children = null,
  buttonVariant = 'none',
  title,
  titleOverlay = null,
  titleAs = 'h5',
  titleWeight = 'bold',
  enableRun = false,
  fileName,
  hash,
  type,
  ...props
}: ScriptEditorModalProps) {
  const value = props.value;
  const readOnly = props?.readOnly;
  const [show, toggle] = useToggle(false);
  const [modalContent, setModalContent] = useState<string>(value);
  const { isVersionMode } = useRiver();
  const hasChanged = modalContent !== value;

  const saveContent = () => {
    props.onChange && props.onChange(modalContent);
  };

  useEffect(() => {
    show && setModalContent(value);
  }, [show, value]);
  return (
    <>
      <TooltipIconButton
        aria-label={`expand ${title}`}
        variant={buttonVariant}
        icon={children ?? <Icon as={FaExpandAlt} />}
        tooltip={`Expand ${enableRun ? '& Preview Results' : ''}`}
        onClick={toggle}
        boxSize="8"
        minW="unset"
      />
      <RiveryModal
        show={show}
        onClose={toggle}
        headerChildren={
          <Flex alignItems="center" gap={2} flexGrow="1">
            <Flex fontSize="md" mr="auto" alignItems="center">
              {title}
              {titleOverlay}
            </Flex>
            <DownloadScriptButton
              script={modalContent}
              type={type}
              fileName={fileName}
            />
          </Flex>
        }
        ariaLabel="source-editor-modal"
        modalProps={scriptModalProps}
        variant="medium"
        style={{
          content: {
            maxHeight: '90vh',
            minHeight: '90vh',
            minWidth: '90vw',
          },
          header: {
            py: 0,
          },
          body: {
            p: 0,
          },
        }}
      >
        <EditorLayout
          {...props}
          hash={hash}
          resetError={!show}
          enableRun={enableRun}
          onSave={saveContent}
          onCancel={toggle}
          onChange={setModalContent}
          value={modalContent}
          readOnly={isVersionMode || readOnly}
          disableSave={!hasChanged}
          type={type}
        />
      </RiveryModal>
    </>
  );
}

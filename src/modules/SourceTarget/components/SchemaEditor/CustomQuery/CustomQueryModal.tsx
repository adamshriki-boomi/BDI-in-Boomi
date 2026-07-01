import { Flex, Icon } from '@chakra-ui/react';
import { RiveryModal } from 'components';
import { TooltipIconButton } from 'components/Buttons/RiveryButton';
import { DownloadScriptButton } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/DownloadScriptButton';
import { ScriptEditorContentProps } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/ScriptEditorContent';
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { FaExpandAlt } from 'react-icons/fa';
import { useToggle } from 'react-use';
import { CustomQueryEditorLayout } from './CustomQueryEditorLayout';

const customQueryModalProps = {
  isCentered: true,
  size: 'xl',
  mx: 6,
};

export type CustomQueryModalProps = ScriptEditorContentProps & {
  children?: ReactElement;
  buttonVariant?: string;
  title?: ReactNode;
  titleOverlay?: ReactNode;
  fileName?: string;
  type: string;
};

/**
 * Modal for expanding the Custom Query editor.
 * Similar to ScriptEditorModal but uses CustomQueryEditorLayout
 * instead of EditorLayout to avoid Logic river dependencies.
 */
export function CustomQueryModal({
  children = null,
  buttonVariant = 'none',
  title,
  titleOverlay = null,
  fileName,
  type,
  ...props
}: CustomQueryModalProps) {
  const value = props.value;
  const readOnly = props?.readOnly;
  const [show, toggle] = useToggle(false);
  const [modalContent, setModalContent] = useState<string>(value);
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
        tooltip="Expand"
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
        ariaLabel="custom-query-editor-modal"
        modalProps={customQueryModalProps}
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
        <CustomQueryEditorLayout
          {...props}
          type={type}
          onSave={saveContent}
          onCancel={toggle}
          onChange={setModalContent}
          value={modalContent}
          readOnly={readOnly}
          disableSave={!hasChanged}
        />
      </RiveryModal>
    </>
  );
}

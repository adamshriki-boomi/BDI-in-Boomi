import { ModalBody, ModalFooter, useDisclosure } from '@chakra-ui/react';
import { Flex, HStack, RiveryButton, RiveryModal, Text } from 'components';
import { Input } from 'components/Form';
import { resolveDateValue } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/DateTimePopover';
import { DateTimeEditor } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/components';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export function ReportDateRangeField({ path }: { path: string }) {
  const formApi = useFormContext();
  const value = useWatch({ control: formApi.control, name: path }) as any;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [draft, setDraft] = useState<any>(value);

  useEffect(() => {
    setDraft(value ? { ...value } : value);
  }, [value]);

  const applyChanges = useCallback(() => {
    if (!draft) return;
    formApi.setValue(path, draft, {
      shouldDirty: true,
      shouldValidate: true,
    });
    onClose();
  }, [draft, formApi, path, onClose]);

  return (
    <Flex flexDir="column" pb={2} gap={1} maxW="350px">
      <HStack spacing={1}>
        <Text color="tagMagenta">*</Text>
        <Text color="primary">Date Range</Text>
      </HStack>
      <Input
        aria-label="Date Range"
        hideLabel
        placeholder="Select Date"
        value={resolveDateValue(value, '')}
        readOnly
        chakra
        onClick={onOpen}
      />
      <RiveryModal
        title="Time Period"
        show={isOpen}
        onClose={onClose}
        modalProps={{ size: '5xl' }}
      >
        <ModalBody
          overflow="auto"
          paddingInline="6"
          paddingBlock="6"
          display="flex"
          flexDir="column"
          gap={4}
        >
          <DateTimeEditor
            value={draft ?? value}
            onChange={setDraft}
            onlyCustom
          />
        </ModalBody>
        <ModalFooter px="4">
          <Flex justifyContent="end" gap={2}>
            <RiveryButton
              label="Cancel"
              size="small"
              variant="default"
              onClick={onClose}
            />
            <RiveryButton
              label="Apply Changes"
              size="small"
              variant="primary"
              isDisabled={!draft}
              onClick={applyChanges}
            />
          </Flex>
        </ModalFooter>
      </RiveryModal>
    </Flex>
  );
}

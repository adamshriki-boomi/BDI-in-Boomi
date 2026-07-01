import {
  chakra,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  useDisclosure,
} from '@chakra-ui/react';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  RiveryButton,
  Text,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import SvgAdjustments from 'components/Icons/components/Adjustments';
import SvgServer from 'components/Icons/components/Server';
import {
  useIsDisabledRiverForm,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { useCallback, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { CustomQuerySourceSettings } from './CustomQuerySourceSettings';
import { CustomQueryTargetFields } from './CustomQueryTargetFields';
import { TargetDefinitions } from '../SchemaTables/components/TargetSchemaDefinitions';
import { TargetTypesV1, storageTargets } from 'api/types';
import { useGetTarget } from 'modules/Datasources/useLogicTargets';
import { EXTRACT_METHOD } from 'modules/SourceTarget/components/form/form.consts';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';

/**
 * Source Definitions Drawer for Custom Query
 * Contains extraction method, incremental settings, etc.
 */
export function SourceDefinitionsDrawer() {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <RiveryButton
        label="Source Definitions"
        variant="default"
        onClick={onOpen}
        leftIcon={<Icon as={SvgAdjustments} boxSize={4} />}
      />
      <Drawer size="lg" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton position="absolute" top={4} onClick={onClose} />
          <DrawerHeader py={4}>
            <HStack
              borderBottom="1px"
              borderBottomColor="gray.300"
              alignItems="center"
              pb={2}
            >
              <Icon as={SvgAdjustments} color="background-selected" />
              <Text textStyle="M4">Source Definitions</Text>
            </HStack>
          </DrawerHeader>
          <SourceDrawerContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function SourceDrawerContent({ onClose }: { onClose: () => void }) {
  const formApi = useSttFormContext();
  const isRiverFormDisabled = useIsDisabledRiverForm();
  const source = formApi?.watch('river.properties.source');

  const innerForm = useForm({
    defaultValues: {
      river: {
        ...formApi.watch('river'),
        properties: {
          source,
        },
      },
    },
  });

  const onApplyChanges = useCallback(() => {
    formApi.setValue(
      'river.properties.source',
      innerForm.watch('river.properties.source'),
      { shouldDirty: true },
    );
    onClose();
  }, [formApi, innerForm, onClose]);

  return (
    <FormProvider {...innerForm}>
      <chakra.fieldset disabled={isRiverFormDisabled} display="contents">
        <DrawerBody sx={{ scrollbarGutter: 'stable' }}>
          <Flex gap={4} flexDir="column" px={4}>
            <CustomQuerySourceSettings />
          </Flex>
        </DrawerBody>
        <RiveryDrawerFooter
          footerHeight="57px"
          handleOnClose={onClose}
          handleOnSuccess={onApplyChanges}
          saveLabel="Apply Changes"
          cancelLabel={
            <RiveryButton
              label="Cancel"
              onClick={e => {
                e.preventDefault();
                onClose();
              }}
              href="#"
              variant="default"
              size="small"
            />
          }
        />
      </chakra.fieldset>
    </FormProvider>
  );
}

// Map of targets that have custom query specific fields
const TARGETS_WITH_CQ_FIELDS = [
  TargetTypesV1.SNOWFLAKE,
  TargetTypesV1.BIG_QUERY,
  TargetTypesV1.REDSHIFT,
  TargetTypesV1.AZURE_SQL_DWH,
];

// Map of targets that have general target-specific definitions
const TARGETS_WITH_DEFINITIONS = [
  TargetTypesV1.SNOWFLAKE,
  TargetTypesV1.BIG_QUERY,
  TargetTypesV1.REDSHIFT,
  TargetTypesV1.ATHENA,
  TargetTypesV1.AZURE_SQL,
  TargetTypesV1.POSTGRES,
  TargetTypesV1.AZURE_SQL_DWH,
  TargetTypesV1.DATABRICKS,
  TargetTypesV1.AMAZON_S3,
  TargetTypesV1.AZURE_BLOB,
];

/**
 * Target Definitions Drawer for Custom Query
 * Contains target-specific settings like table prefix, snapshot tables, etc.
 */
export function TargetDefinitionsDrawer() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const formApi = useSttFormContext();

  const targetName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.name',
  });
  const extractMethod = useWatch({
    control: formApi.control,
    name: EXTRACT_METHOD,
  });
  const selectedTarget = useGetTarget(targetName);

  // Check if there's any content to show in the drawer
  const hasContent = useMemo(() => {
    // Check for custom query specific fields
    const hasCQFields = TARGETS_WITH_CQ_FIELDS.includes(targetName);

    // Check for snapshot table option (LOG mode)
    const hasSnapshotTable =
      !storageTargets.includes(targetName) &&
      extractMethod === IRiverExtractMethod.LOG;

    // Check for set target order option
    const hasSetTargetOrder =
      selectedTarget?.target_settings?.include_set_target_order;

    // Check for target-specific definitions
    const hasTargetDefinitions = TARGETS_WITH_DEFINITIONS.includes(targetName);

    return (
      hasCQFields ||
      hasSnapshotTable ||
      hasSetTargetOrder ||
      hasTargetDefinitions
    );
  }, [targetName, extractMethod, selectedTarget]);

  // Don't render the drawer button if there's no content to show
  if (!hasContent) {
    return null;
  }

  return (
    <>
      <RiveryButton
        label="Target Definitions"
        variant="default"
        onClick={onOpen}
        leftIcon={<Icon as={SvgServer} boxSize={4} />}
      />
      <Drawer size="default" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton position="absolute" top={4} onClick={onClose} />
          <DrawerHeader py={4}>
            <HStack
              borderBottom="1px"
              borderBottomColor="gray.300"
              alignItems="center"
              pb={2}
            >
              <Icon as={SvgServer} color="background-selected" />
              <Text textStyle="M4">Target Definitions</Text>
            </HStack>
          </DrawerHeader>
          <TargetDrawerContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function TargetDrawerContent({ onClose }: { onClose: () => void }) {
  const formApi = useSttFormContext();
  const isRiverFormDisabled = useIsDisabledRiverForm();
  const source = formApi?.watch('river.properties.source');
  const target = formApi?.watch('river.properties.target');
  const schemas = formApi?.watch('river.properties.schemas');

  const innerForm = useForm({
    defaultValues: {
      river: {
        ...formApi.watch('river'),
        properties: {
          source,
          target,
          schemas,
        },
      },
    },
  });

  const onApplyChanges = useCallback(() => {
    formApi.setValue(
      'river',
      {
        ...formApi.watch('river'),
        properties: {
          ...formApi.watch('river.properties'),
          source: innerForm.watch('river.properties.source'),
          target: innerForm.watch('river.properties.target'),
        },
      },
      { shouldDirty: true },
    );
    onClose();
  }, [formApi, innerForm, onClose]);

  return (
    <FormProvider {...innerForm}>
      <chakra.fieldset disabled={isRiverFormDisabled} display="contents">
        <DrawerBody sx={{ scrollbarGutter: 'stable' }}>
          <Flex flexDir="column" gap={4}>
            <CustomQueryTargetFields targetName={target?.name} />
            <TargetDefinitions formApi={innerForm} />
          </Flex>
        </DrawerBody>
        <RiveryDrawerFooter
          footerHeight="57px"
          handleOnClose={onClose}
          handleOnSuccess={onApplyChanges}
          saveLabel="Apply Changes"
          cancelLabel={
            <RiveryButton
              label="Cancel"
              onClick={e => {
                e.preventDefault();
                onClose();
              }}
              href="#"
              variant="default"
              size="small"
            />
          }
        />
      </chakra.fieldset>
    </FormProvider>
  );
}

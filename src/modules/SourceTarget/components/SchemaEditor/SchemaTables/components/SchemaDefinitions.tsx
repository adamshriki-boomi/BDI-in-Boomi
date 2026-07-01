import {
  chakra,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  useDisclosure,
} from '@chakra-ui/react';
import { SourceTypes } from 'api/types';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import SvgAdjustments from 'components/Icons/components/Adjustments';
import {
  useGetRiverCommonProps,
  useIsCustomQuery,
  useIsDisabledRiverForm,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CustomQuerySourceSettings } from '../../CustomQuery/CustomQuerySourceSettings';
import { SourceDefinitions } from './SourceSchemaDefinitions';
import { TargetDefinitions } from './TargetSchemaDefinitions';
import { DefinitionsCollapse } from './SchemaDefinitionsCollapse';

export function SchemaDefinitions() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const isCustomQuery = useIsCustomQuery();

  const buttonLabel = isCustomQuery
    ? 'Advanced Definitions'
    : 'Tables Definitions';

  return (
    <>
      <RiveryButton
        label={buttonLabel}
        gridArea="definitions"
        variant="default"
        onClick={onOpen}
        leftIcon={<Icon as={SvgAdjustments} boxSize={4} />}
      />
      <Drawer
        size={isCustomQuery ? 'lg' : 'default'}
        isOpen={isOpen}
        onClose={onClose}
      >
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
              <Text textStyle="M4">{buttonLabel}</Text>
            </HStack>
          </DrawerHeader>

          <DrawerFormContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function DrawerFormContent({ onClose }) {
  // //I'm making an inner form here for an intermidiate state of the source and target definitions,
  // //we need that because of the apply/cancel buttons

  const formApi = useSttFormContext();
  const { isCDC } = useGetRiverCommonProps();
  const isCustomQuery = useIsCustomQuery();
  const source = formApi?.watch('river.properties.source');
  const target = formApi?.watch('river.properties.target');
  const schemas = formApi?.watch('river.properties.schemas');
  const isRiverFormDisabled = useIsDisabledRiverForm();
  const innerDefinitionsForm = useForm({
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
          source: innerDefinitionsForm.watch('river.properties.source'),
          target: innerDefinitionsForm.watch('river.properties.target'),
        },
      },
      { shouldDirty: true },
    );
    onClose();
  }, [formApi, innerDefinitionsForm, onClose]);

  return (
    <FormProvider {...innerDefinitionsForm}>
      <chakra.fieldset disabled={isRiverFormDisabled} display="contents">
        <>
          <DrawerBody sx={{ scrollbarGutter: 'stable' }}>
            <Flex gap={4} flexDir="column">
              {/* Custom Query Source Settings */}
              <RenderGuard condition={isCustomQuery}>
                <DefinitionsCollapse type="source" defaultOpen>
                  <CustomQuerySourceSettings />
                </DefinitionsCollapse>
              </RenderGuard>

              {/* Standard Source Definitions (non-custom query) */}
              <RenderGuard
                condition={
                  !isCustomQuery &&
                  sourceDefinitions(isCDC).includes(source?.name as SourceTypes)
                }
              >
                <SourceDefinitions formApi={innerDefinitionsForm} />
              </RenderGuard>
              <TargetDefinitions formApi={innerDefinitionsForm} />
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
        </>
      </chakra.fieldset>
    </FormProvider>
  );
}

const sourceDefinitions = (showWhenCDC: boolean) => [
  SourceTypes.MYSQL,
  SourceTypes.MARIADB,
  SourceTypes.MSSQL,
  SourceTypes.ORACLE,
  showWhenCDC && SourceTypes.POSTGRES,
  showWhenCDC && SourceTypes.MONGO,
  SourceTypes.VERTICA,
  SourceTypes.NETSUITE_ANALYTICS,
  SourceTypes.SALESFORCE,
];

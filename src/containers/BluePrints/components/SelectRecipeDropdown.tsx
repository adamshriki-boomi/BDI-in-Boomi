import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import {
  Box,
  Center,
  EditIcon,
  Flex,
  HStack,
  Icon,
  PageOverlaySpinner,
  RdsRecipeFile,
  RenderGuard,
  Text,
  TransparentIconButton,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { CustomSelectForm } from 'components/Form';
import { getQueryParams } from 'hooks/router';
import { useToastComponent } from 'hooks/useToast';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { ChangeConnectionConfirmation } from 'modules/SourceTarget/components/ConnectionSetup/ConfirmChangeConnection';
import { useResetSource } from 'modules/SourceTarget/components/form/form.hooks';
import { useReachedTablesLimit } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/TableLimitMessage';
import { S2TDataSourceDisplay } from 'modules/SourceTarget/components/SelectDataSource/S2TDataSourceDisplay';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { useEffectOnce, useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useGetBlueprintsListQuery } from '../blueprints.query';
import {
  ActionTypeEnum,
  mergeArraysWithOverride,
  useGetBlueprint,
  useGetBlueprintInterfaceParams,
  useIsInterfacePrametersSet,
  useSaveBlueprint,
} from '../helpers';
import BlueprintCreation from './BlueprintCreation';
import InterfaceParametersComponent from './InterfaceParameters';

export function EditButton({ editBlueprint, ...props }) {
  const {
    hasValue,
    selectProps: { value },
  } = props;
  useEffectOnce(() => {
    if (!value?.value) {
      props.setValue(undefined);
    }
  });
  return hasValue && value?.value ? (
    <TransparentIconButton
      h={0}
      ml="auto"
      aria-label="edit-selected-blueprint"
      icon={<Icon as={EditIcon} color="icon-tertiary" />}
      onClick={e => {
        e.stopPropagation();
        editBlueprint(value?.value);
      }}
    />
  ) : null;
}

export function CustomBlueprintOption({
  innerProps,
  isSelected,
  editBlueprint,
  data,
  value,
  label,
}) {
  return (
    <HStack
      h="100%"
      width="100%"
      justify="space-between"
      sx={{
        '&:hover': {
          '& .chakra-icon': {
            visibility: 'visible',
          },
        },
      }}
      {...innerProps}
    >
      <Box borderRadius={4}>{label}</Box>
      <Icon
        as={EditIcon}
        boxSize={4}
        color={isSelected ? 'white' : 'icon'}
        role="button"
        visibility="hidden"
        onClick={e => {
          e.stopPropagation();
          editBlueprint(value);
        }}
      />
    </HStack>
  );
}

export default function SelectBlueprint() {
  const [loading, setLoading] = useToggle(false);
  const { error } = useToastComponent();
  const isNewRiver = useIsInNewS2TRiver();
  const formApi = useFormContext();
  const { blueprint_id } = getQueryParams(['blueprint_id']);
  const { field: blueprintId } = useController({
    name: 'river.properties.source.additional_settings.recipe_id',
    control: formApi.control,
  });

  //Checking the number of tables in the schema to define whether mapping happened or not
  const schemas = useWatch({
    control: formApi.control,
    name: 'river.properties.schemas',
  });
  const { currentTablesLength } = useReachedTablesLimit(schemas);
  const { getBlueprintInterfaceParams, isUninitialized } =
    useGetBlueprintInterfaceParams();
  const [blueprintForChange, setBlueprintForChange] = useState(null);
  const [selectedBlueprint, selectBlueprint] = useState(null);
  const { activeAccountId: account_id } = useCore();
  const { data: blueprints } = useGetBlueprintsListQuery({
    account_id,
    items_per_page: 500,
  } as any);
  const { hasSelectedInterfaceParams } = useIsInterfacePrametersSet();
  const options = useMemo(
    () =>
      blueprints?.items.map(blueprint => ({
        label: blueprint.name,
        value: blueprint.cross_id,
      })),
    [blueprints?.items],
  );

  const editBlueprint = useCallback(id => selectBlueprint(id), []);

  const selectComponents = useMemo(() => {
    const components = {
      Option: props => (
        <CustomBlueprintOption editBlueprint={editBlueprint} {...props} />
      ),
      IndicatorSeparator: props => (
        <EditButton editBlueprint={editBlueprint} {...props} />
      ),
    };
    return components;
  }, [editBlueprint]);
  const resetSource = useResetSource();

  const onSelectBlueprint = useCallback(
    (option, existingSourceParams = null) => {
      if (option?.value) {
        setLoading(true);
        blueprintId.onChange(option?.value);
        getBlueprintInterfaceParams(option?.value)?.then(res => {
          if (res?.data) {
            const globalParams = res.data?.global_params ?? {};
            const blueprintType = res.data?.blueprint_type;
            const standardArray = [...(globalParams?.standard ?? [])];
            let source = standardArray;
            if (existingSourceParams?.source) {
              source = mergeArraysWithOverride(
                standardArray,
                existingSourceParams.source,
              );
            }
            const isLegacy = blueprintType === 'legacy';
            const savedSchemas =
              (formApi.getValues(
                'river.properties.schemas.no_schema' as any,
              ) as any) ?? {};
            const savedTableDateRange = Object.values(savedSchemas).find(
              (t: any) =>
                t &&
                typeof t === 'object' &&
                t.is_selected &&
                (t.date_range?.start_date || t.date_range?.end_date),
            ) as any;
            const existingBlueprintDateRange = (
              formApi.getValues('blueprint' as any) as any
            )?.date_range;
            const isSameBlueprint =
              existingBlueprintDateRange?.name &&
              existingBlueprintDateRange.name ===
                globalParams?.date_range?.name;
            const preservedStartDate = isSameBlueprint
              ? existingBlueprintDateRange?.start_date
              : undefined;
            const preservedEndDate = isSameBlueprint
              ? existingBlueprintDateRange?.end_date
              : undefined;
            const legacyDateRange =
              isLegacy && globalParams?.date_range?.name
                ? {
                    ...globalParams.date_range,
                    time_period: 'custom',
                    start_date:
                      preservedStartDate ??
                      savedTableDateRange?.date_range?.start_date ??
                      globalParams.date_range.start_date ??
                      null,
                    end_date:
                      preservedEndDate ??
                      savedTableDateRange?.date_range?.end_date ??
                      globalParams.date_range.end_date ??
                      null,
                  }
                : null;
            formApi.setValue('blueprint', {
              authentication: globalParams?.authentication,
              type: blueprintType,
              ...(legacyDateRange && { date_range: legacyDateRange }),
            });
            formApi.setValue(
              'river.properties.source.additional_settings.interface_parameters',
              { source },
            );
          }
          if (res?.error) {
            error({
              title: 'Error',
              description: 'Failed to fetch interface parameters',
            });
          }
          setLoading(false);
        });
      }
    },
    [blueprintId, error, formApi, getBlueprintInterfaceParams, setLoading],
  );

  useEffect(() => {
    if (blueprint_id && !blueprintId.value) {
      blueprintId.onChange(blueprint_id);
    } else if (isUninitialized && blueprintId.value) {
      const existingSourceParams = formApi?.watch(
        'river.properties.source.additional_settings.interface_parameters',
      );
      onSelectBlueprint({ value: blueprintId.value }, existingSourceParams);
    }
  }, [
    blueprintId,
    blueprintId.value,
    blueprint_id,
    formApi,
    isUninitialized,
    onSelectBlueprint,
  ]);

  return (
    <Center {...(!isNewRiver && { alignItems: 'start' })}>
      <Flex flexDir="column" gap={6}>
        <RenderGuard condition={isNewRiver}>
          <Flex flexDir="column">
            <Text textStyle="M6" color="primary">
              Selected Data Source
            </Text>
            <S2TDataSourceDisplay
              value="Blueprint"
              icon={RdsRecipeFile}
              onClick={() => resetSource()}
            />
          </Flex>
        </RenderGuard>
        <Flex flexDir="column" alignSelf="baseline">
          <Text textStyle="M6" color="primary">
            {isNewRiver ? 'Blueprints' : 'Selected Blueprint'}
          </Text>
          <RenderGuard condition={isNewRiver}>
            <Text>
              Select the blueprint you would like to set as a Data Source:
            </Text>
          </RenderGuard>
          <Box w="440px" pt={2}>
            <CustomSelectForm
              options={options}
              controlId="select blueprint"
              isMulti={false}
              components={selectComponents}
              value={options?.find(o => o.value === blueprintId.value)}
              onChange={(option: any) => {
                if (blueprintId?.value && currentTablesLength > 0) {
                  setBlueprintForChange(option?.value);
                  return;
                }
                onSelectBlueprint(option);
              }}
            />
          </Box>
          <EditBlueprintFileModal
            selectBlueprint={selectBlueprint}
            selectedBlueprint={selectedBlueprint}
          />
        </Flex>
        <RenderGuard condition={loading}>
          <PageOverlaySpinner />
        </RenderGuard>
        <RenderGuard condition={Boolean(hasSelectedInterfaceParams)}>
          <InterfaceParametersComponent />
        </RenderGuard>
      </Flex>
      <ChangeConnectionConfirmation
        showConfirmation={Boolean(blueprintForChange)}
        toggleConfirmation={() => setBlueprintForChange(null)}
        onChange={() => onSelectBlueprint({ value: blueprintForChange })}
        onDismiss={() => blueprintId.onChange(blueprintId.value)}
        entity="Blueprint"
      />
    </Center>
  );
}

export function EditBlueprintFileModal({ selectedBlueprint, selectBlueprint }) {
  const { file, formApi, loading } = useGetBlueprint(selectedBlueprint);
  const { saveBlueprint, loading: saving } = useSaveBlueprint(
    ActionTypeEnum.EDIT,
  );
  const onSaveFile = useCallback(async () => {
    await saveBlueprint(
      formApi?.watch('yaml'),
      formApi?.watch('name'),
      '',
      file,
      selectedBlueprint,
    );
    selectBlueprint(null);
  }, [file, formApi, saveBlueprint, selectBlueprint, selectedBlueprint]);

  return (
    <Drawer
      variant="semifull"
      isOpen={selectedBlueprint}
      onClose={() => selectBlueprint(null)}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottom="1px" borderBottomColor="gray.300" pb={2}>
          <Text>Edit Blueprint file</Text>
        </DrawerHeader>
        <DrawerBody>
          {saving && <PageOverlaySpinner />}
          <BlueprintCreation
            s2t
            selectedBlueprint={selectedBlueprint}
            file={file}
            formApi={formApi}
            loading={loading}
          />
        </DrawerBody>
        <RiveryDrawerFooter
          handleOnClose={() => selectBlueprint(null)}
          handleOnSuccess={onSaveFile}
        />
      </DrawerContent>
    </Drawer>
  );
}

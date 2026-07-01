import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Textarea,
} from '@chakra-ui/react';
import { storageTargets, TargetTypesV1 } from 'api/types';
import {
  DeleteIcon,
  Flex,
  Grid,
  Icon,
  RenderGuard,
  Revert,
  RiveryButton,
  Text,
  TooltipIconButton,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { Input } from 'components/Form';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';
import { IModifiedColumn } from 'modules/SourceTarget/store';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { compare } from 'utils/array.utils';
import { IMappingItem } from '../../types';
import { createModifiedColumn } from '../../utils';
import { ModeSelect } from './ModeSelect';
import { TypeSelect } from './TypeSelect';

interface Props {
  value: IModifiedColumn;
  metadata: IMappingItem[];
  onChange: (value: IModifiedColumn) => any;
  onClose: () => any;
  onDelete: (name: string) => any;
}
export function ColumnMappingEditor({
  onClose,
  value,
  metadata,
  onChange,
  onDelete,
}: Props) {
  const { targetType } = useMainFormColumnsDefinitions();
  const isStorage = storageTargets.includes(targetType);
  const normalizedValue = normalizeValue(
    { ...value, alias: value.alias ?? value.name },
    metadata,
  );

  const formApi = useForm<IModifiedColumn>({
    defaultValues: normalizedValue,
  });

  const handleOnReset = () => {
    const columnMetadata = findByName(metadata, value.name);
    const draft = createModifiedColumn({
      name: columnMetadata.name,
      alias: columnMetadata.name,
      ...columnMetadata,
    });
    const newColumn = combineColumnMetadata(
      { ...draft, mode: 'NULLABLE' },
      columnMetadata,
    );
    formApi.reset(newColumn);
  };

  const shouldReset = value.name !== formApi.watch('name');
  // TODO - this needs to be resolved according to a value that indicates this is a calculated column
  const calculatedColumn = formApi.watch('calculated_column_mode');
  const isCalculatedColumn = Boolean(calculatedColumn);
  useEffect(() => {
    if (shouldReset && normalizedValue) {
      formApi.reset(normalizedValue, { keepDefaultValues: false });
    }
  }, [formApi, normalizedValue, shouldReset]);

  return (
    <FormProvider {...formApi}>
      <Drawer size="default" isOpen={true} onClose={onClose}>
        <DrawerOverlay zIndex={1400} />
        <DrawerContent>
          <DrawerHeader>
            <Flex
              alignItems="center"
              borderBottom="1px"
              borderBottomColor="gray.300"
              pb={2}
            >
              <Text textStyle="M4" mr="auto">
                {isCalculatedColumn ? 'Calculated Column' : 'Column Mapping'}
              </Text>
              <RenderGuard
                condition={!isCalculatedColumn}
                fallback={
                  <TooltipIconButton
                    tooltip="Delete calculated column"
                    icon={<Icon as={DeleteIcon} />}
                    aria-label="delete column"
                    size="sm"
                    bg="transparent"
                    _hover={{ bg: 'transparent' }}
                    onClick={() => onDelete(formApi.watch('name'))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                }
              >
                <TooltipIconButton
                  tooltip="Reset column definition"
                  icon={<Icon as={Revert} />}
                  aria-label="reset column"
                  size="sm"
                  bg="transparent"
                  _hover={{ bg: 'transparent' }}
                  onClick={handleOnReset}
                />
              </RenderGuard>
            </Flex>
          </DrawerHeader>

          <DrawerBody pt={0}>
            <Grid gridAutoRows="min-content" gap={6}>
              <RenderGuard
                condition={isCalculatedColumn}
                fallback={
                  <Input
                    label="Source Column Name"
                    name="name"
                    api={formApi}
                    chakra
                    isDisabled
                  />
                }
              >
                <Input
                  label="Calculated Column Expression Type"
                  name="calculated_column_mode"
                  api={formApi}
                  chakra
                  isDisabled
                />
              </RenderGuard>
              <RenderGuard condition={isCalculatedColumn}>
                <Input
                  label="Expression"
                  name="expression"
                  api={formApi}
                  chakra
                  {...(isCalculatedColumn && {
                    as: Textarea,
                    size: 10,
                    fontSize: 'sm',
                  })}
                />
              </RenderGuard>
              <Flex flexDir="column">
                <Input
                  label="Target Column Name"
                  secondaryLabel="Avoid using reserved words e.g. INSERT, SELECT, ROWID, etc."
                  name="alias"
                  api={formApi}
                  chakra
                />
              </Flex>
              <RenderGuard condition={!isStorage}>
                <TypeSelect target={targetType} />
              </RenderGuard>
              <RenderGuard
                condition={
                  ![
                    TargetTypesV1.REDSHIFT,
                    TargetTypesV1.AZURE_SQL_DWH,
                  ].includes(targetType)
                }
              >
                <ModeSelect />
              </RenderGuard>
            </Grid>
          </DrawerBody>
          <RiveryDrawerFooter
            footerHeight="57px"
            handleOnClose={onClose}
            handleOnSuccess={() => onChange(formApi.watch())}
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
        </DrawerContent>
      </Drawer>
    </FormProvider>
  );
}

// UTILS
const findByName = (metadata: IMappingItem[], value: string) => {
  return metadata?.find(compare('name', value));
};

const combineColumnMetadata = (
  column: IModifiedColumn,
  metadata: IMappingItem,
) => {
  return Object.fromEntries(
    Object.entries(column).map(([key, val]) => {
      const metdataValue = metadata?.[key];
      //0 and false are valid values
      const resultValue = ![undefined, null].includes(val)
        ? val
        : metdataValue
        ? metdataValue
        : //false value is also a valid value
        val === false
        ? false
        : null;
      return [key, resultValue];
    }),
  ) as IModifiedColumn;
};
const normalizeValue = (value: IModifiedColumn, metadata: IMappingItem[]) => {
  const columnMetadata = findByName(metadata, value.name);
  return combineColumnMetadata({ ...columnMetadata, ...value }, columnMetadata);
};

import { DrawerBody, DrawerCloseButton } from '@chakra-ui/react';
import { storageTargets } from 'api/types';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridBox,
  HStack,
  PlusIcon,
  RenderGuard,
  RiveryButton,
  useDisclosure,
} from 'components';
import { RiverySwitch } from 'components/Form';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';
import { IModifiedColumn } from 'modules/SourceTarget/store';
import React, { ReactNode, useCallback } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import {
  ExpressionTypeSelect,
  useHandleCalculatedExpressions,
} from '../../../TableSource/SourceCommonSettings';
import { CalculatedColumns } from '../../CalculatedColumn';
import { createModifiedColumn } from '../../utils';
import { TypeSelect } from './TypeSelect';

interface AddCalculatedColumnProps {
  onChange: (column: IModifiedColumn) => any;
  children: ReactNode;
  isDisabled?: boolean;
}

export function AddCalculatedColumn({
  onChange,
  children,
  isDisabled,
}: AddCalculatedColumnProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <GridBox>
      <RiveryButton
        label={children}
        variant="default"
        alignItems="center"
        justifyContent="start"
        boxSize="full"
        fontSize="sm"
        _hover={{
          color: 'primary',
        }}
        leftIcon={<PlusIcon />}
        onClick={onOpen}
        isDisabled={isDisabled}
      />
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="default"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            fontWeight="600!important"
            borderBottom="1px"
            borderColor="gray.300"
            px="0"
            mx="6"
          >
            {children}
          </DrawerHeader>

          <ColumnFormProvider>
            <AddCalculatedColumnForm onChange={onChange} onClose={onClose} />
          </ColumnFormProvider>
        </DrawerContent>
      </Drawer>
    </GridBox>
  );
}

const ColumnFormProvider = ({ children }) => {
  const formMethods = useForm<IModifiedColumn>({
    defaultValues: createModifiedColumn(),
  });
  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

const AddCalculatedColumnForm = ({ onChange, onClose }) => {
  const { sourceType, targetType } = useMainFormColumnsDefinitions();
  const { isDisabled, defaultValue, hasSourceColumns } =
    useHandleCalculatedExpressions(sourceType, targetType);

  const isStorage = storageTargets.includes(targetType);

  const formMethods = useFormContext<IModifiedColumn>();
  const submit = useCallback(
    values => {
      const srcCalculated = values?.calculated_column_mode === 'source';
      onChange({
        ...values,
        alias: values.name,
        calculated_column_mode: hasSourceColumns
          ? values?.calculated_column_mode
          : 'target',
        ...(!srcCalculated && { order: 0 }),
      });
      onClose();
    },
    [onChange, onClose, hasSourceColumns],
  );
  const isApplyDisabled =
    !formMethods?.watch('name') ||
    !formMethods?.watch('expression') ||
    (!isStorage && !formMethods?.watch('type'));

  return (
    <Grid
      h="full"
      as="form"
      onSubmit={formMethods.handleSubmit(submit)}
      templateRows="1fr min-content"
    >
      <DrawerBody>
        <GridBox gridGap="6" gridAutoRows="min-content">
          <ExpressionTypeSelect
            isDisabled={isDisabled}
            defaultValue={defaultValue}
          />
          <CalculatedColumns />
          <RenderGuard condition={!isStorage}>
            <TypeSelect label="Data Type" target={targetType} />
          </RenderGuard>
          <RenderGuard condition={!isStorage}>
            <RiverySwitch
              label="Set column as Match Key"
              leftLabel
              isChecked={formMethods?.watch('is_key')}
              onChange={({ target }) =>
                formMethods.setValue('is_key', target.checked)
              }
              formControlStyle={{
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            />
          </RenderGuard>
        </GridBox>
      </DrawerBody>
      <HStack
        borderTop="1px"
        borderTopColor="gray.300"
        justify="space-between"
        alignSelf="flex-end"
        px={6}
        py={4}
      >
        <RiveryButton
          label="Close"
          variant="default"
          mr={3}
          onClick={onClose}
          size="sm"
        />
        <RiveryButton
          type="submit"
          label="Add Column"
          size="sm"
          isDisabled={isApplyDisabled}
        />
      </HStack>
    </Grid>
  );
};

import {
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import {
  Box,
  Drawer,
  Flex,
  GridBox,
  HStack,
  RiveryTable,
  Text,
} from 'components';
import { CloseIconButton } from 'components/Buttons/RiveryButton';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { Input } from 'components/Form';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { useToastComponent } from 'hooks/useToast';
import { getErrorsVariables } from 'modules/EnvironmentVariables/VariablesDrawer';
import { validateReservedVariableName } from 'utils/validations';
import { FormProvider, useForm } from 'react-hook-form';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { useEnvironments, useEnvironmentsActions } from 'store/environments';
import { useEnvironmentsVariables } from 'store/environments/hooks/useGetEnvironment';
import { getOId } from 'utils/api.sanitizer';
import { ViewModes } from '../Deployments/components/helpers';
import {
  useGetEnvironmentsQuery,
  useLazyGetEnvironmentsQuery,
} from '../environments.query';
import {
  resetFormTableValues,
  useNewVariableColumns,
} from './VariableConfigTable';
import './VariablesManager.scss';

const noop = () => void 0;
export function ActionDrawer({ variable }) {
  const mode = variable ? 'Edit' : 'Add';
  const { setDrawerState } = useEnvironmentsActions();
  const { isDrawerOpen } = useEnvironments();

  return (
    <Drawer
      size="medium"
      isOpen={isDrawerOpen}
      placement="right"
      onClose={noop}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <HStack
            w="100%"
            justify="space-between"
            pb={2}
            borderBottom="1px solid"
            borderBottomColor="gray.300"
          >
            <Text textStyle="M4">{mode} Variable</Text>
            <CloseIconButton
              aria-label="close action drawer"
              onClick={() => setDrawerState(false)}
            />
          </HStack>
        </DrawerHeader>
        <FormBody existingVariable={variable} />
      </DrawerContent>
    </Drawer>
  );
}

const useTableData = () => {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  return (
    environmentsArray?.map(({ environment_name, cross_id, color }) => ({
      color,
      environment_name,
      id: getOId(cross_id),
    })) ?? []
  );
};

function useUpdateFormValues(existingVariable, formApi) {
  const variables = useEnvironmentsVariables();
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const environmentValues = Object.assign(
    {},
    ...environmentsArray.map(({ cross_id }) => ({ [cross_id]: '' })),
  );
  useEffectOnce(() => {
    if (existingVariable) {
      resetFormTableValues(variables, existingVariable, formApi);
    } else {
      formApi.reset({ values: environmentValues });
    }
  });
}

function FormBody({ existingVariable }) {
  const { addVariableToSelectedEnvironments, deleteVariable, setDrawerState } =
    useEnvironmentsActions();
  const [fetchEnvironments] = useLazyGetEnvironmentsQuery();
  const { success, error } = useToastComponent();
  const mode = existingVariable ? 'Edit' : 'Add';
  const isNew = !Boolean(existingVariable);
  const tableData = useTableData();
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const columns = useNewVariableColumns(isNew);
  const formApi = useForm<{
    variable_name: string;
    values: Record<string, string>;
  }>({
    defaultValues: {
      variable_name: '',
      values: {},
    },
    mode: 'onChange',
  });
  const { handleSubmit } = formApi;
  useUpdateFormValues(existingVariable, formApi);

  const [{ loading }, onSubmit] = useAsyncFn(
    async formData => {
      const { variable_name, values } = formData;
      const { values: dirtyValues } = formApi.formState.dirtyFields;

      const envValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value ?? '';
        }
        return acc;
      }, {});

      if (Object.keys(envValues).length === 0) {
        return error({
          duration: 5000,
          description: (
            <Flex flexDir="column">
              <Text>Variables must be associated with at least one value.</Text>
              <Text>
                If you wish to disable all values, please delete the variable.
              </Text>
            </Flex>
          ),
        });
      }

      if (!isNew) {
        const environmentsForDeletion = Object.keys(dirtyValues)
          .map(environment => {
            if (values[environment] === undefined) {
              return environment;
            }
            return null;
          })
          .filter(value => value);
        if (environmentsForDeletion.length > 0) {
          await deleteVariable({
            variable_name,
            environments: environmentsForDeletion,
          });
        }
      }

      const response: any = await addVariableToSelectedEnvironments({
        values: envValues,
        variable_name,
      });
      if (response?.payload?.success) {
        setDrawerState(false);
        await fetchEnvironments('');
        success({
          description: `Variable was successfully ${
            existingVariable ? 'edited' : 'added'
          }`,
        });
      }
    },
    [
      addVariableToSelectedEnvironments,
      deleteVariable,
      error,
      existingVariable,
      fetchEnvironments,
      formApi.formState.dirtyFields,
      isNew,
      setDrawerState,
      success,
    ],
  );

  return (
    <FormProvider {...formApi}>
      <form style={{ height: '100%' }} onSubmit={handleSubmit(onSubmit)}>
        {loading ? <PageOverlaySpinner /> : null}
        <Flex h="100%" direction="column" justify="space-between">
          <DrawerBody>
            <Flex flexDirection="column" gap={4}>
              <Box w={300}>
                <Input
                  disabled={existingVariable}
                  name="variable_name"
                  label="Variable Name"
                  aria-label="Variable Name"
                  placeholder="Enter a name..."
                  required="Variable name is required"
                  validate={value => {
                    if (existingVariable) {
                      return null; //no need to validate on existing varaibles
                    } else {
                      const reservedError = validateReservedVariableName(value);
                      if (reservedError) {
                        return reservedError;
                      }
                      const errors = getErrorsVariables(
                        value,
                        environmentsArray
                          .map(env => Object.keys(env.variables))
                          .flat(),
                      );
                      return errors.find(subject => subject.invalid)?.message;
                    }
                  }}
                  api={formApi}
                  chakra
                />
              </Box>
              <Text fontSize="sm" color="font-secondary">
                Select the environments in which you want the variable to be
                active, and then give it a value.
              </Text>
              <GridBox maxHeight="60vh">
                <RiveryTable
                  ariaLabel="selected environment variables"
                  filterLabel="Search Environment"
                  noPagination
                  entityType="Environments"
                  data={tableData}
                  columns={columns}
                  rowHandlers={{ isCustomPadding: true }}
                  contentProps={{ maxHeight: '60vh' }}
                  customFilterColumns={['environment_name']}
                />
              </GridBox>
            </Flex>
          </DrawerBody>
          <RiveryDrawerFooter
            cancelLabel="Cancel"
            saveLabel={
              mode === ViewModes.ADD ? 'Add Variable' : 'Apply Changes'
            }
            handleOnClose={() => setDrawerState(false)}
            handleOnSuccess={() => null}
            disabledSave={!formApi.formState.isValid}
          />
        </Flex>
      </form>
    </FormProvider>
  );
}

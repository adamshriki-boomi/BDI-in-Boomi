import { Grid, Icon } from '@chakra-ui/react';
import { ArrowNarrowRight, Box, Flex, HStack, Text } from 'components';
import { Input } from 'components/Form';
import { getQueryParams } from 'hooks/router';
import {
  SelectComponent,
  useEnvironmentOptions,
} from 'modules/Environments/components/EnvironmentsSelector';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { getOId } from 'utils/api.sanitizer';
import { alphaNumericValidation } from 'utils/validations';
import { useGetFormValues, ViewModes } from '../components/helpers';
import { useGetPackagesQuery } from '../packages.query';

const usePackageNameValidation = () => {
  const { data: packages } = useGetPackagesQuery(null);
  return useCallback(
    name => {
      const value = name;
      const re = new RegExp(`^${value.replace(/\\+$/, '')}$`, 'i');
      const errors = [
        {
          name: 'nameExists',
          invalid: Boolean(
            packages?.find(({ package_name }) => package_name?.match(re)),
          ),
        },
        {
          name: 'containsInvalidChars',
          invalid: !alphaNumericValidation.test(name),
        },
      ];
      return errors.find(subject => subject.invalid)?.name;
    },
    [packages],
  );
};

export function Step1({ mode = ViewModes.ADD }) {
  const isDisabled = mode === ViewModes.VIEW;
  const formApi = useFormContext();
  const environments = useEnvironmentOptions('is_deployable_environments=true');
  const { control } = formApi;
  const { deployment_id, package_id } = getQueryParams([
    'deployment_id',
    'package_id',
  ]);

  const { sourceEnv, targetEnv, id } = useGetFormValues(control);
  const { data: allPackages } = useGetPackagesQuery(null);
  const currentPackageName = allPackages?.filter(
    ({ _id }) => getOId(_id) === getOId(id),
  )[0]?.package_name;
  const packageNameValidation = usePackageNameValidation();

  useEffect(() => {
    if (
      targetEnv &&
      sourceEnv === targetEnv &&
      !formApi?.formState?.errors?.env_id_trg
    ) {
      formApi.setError('env_id_trg.$oid', {
        message: 'Target must differ from source',
      });
    }
    if (sourceEnv !== targetEnv && formApi?.formState?.errors?.env_id_trg) {
      formApi?.clearErrors('env_id_trg');
    }
  }, [formApi, sourceEnv, targetEnv]);

  useEffectOnce(() => formApi.setFocus('package_name'));

  return (
    <Grid templateRows="min-content auto 1fr" py={1} gap={4}>
      <Text color="font-secondary">
        Welcome to the new Package Creation. Follow the next three steps and
        you'll be good to go.
      </Text>
      <Flex direction="column" gap={1} maxWidth={550}>
        <Flex flexDir="column">
          <HStack>
            <Text color="tagMagenta">*</Text>
            <Text fontSize="md" fontWeight="medium" color="primary">
              Package Name
            </Text>
          </HStack>
          <Text fontSize="sm" color="font-secondary">
            Enter a name that will help you identify this package.
            <br />
            Note, the package ID will be generated at the end of the process.
          </Text>
        </Flex>
        <Input
          isDisabled={isDisabled}
          placeholder="Enter package name"
          name="package_name"
          label="Package name"
          aria-label="Package name"
          hideLabel
          validate={name => {
            const shouldValidate =
              mode === ViewModes.ADD ||
              (mode === ViewModes.EDIT && currentPackageName !== name);
            const messages = {
              nameExists:
                'This package name is already in use. Consider a different one.',
              containsInvalidChars:
                'Special characters are not allowed in Package Name',
            };
            const res = packageNameValidation(name);
            if (['', null, undefined].includes(name)) {
              return 'Package name is required';
            }
            return shouldValidate && res ? messages[res] : true;
          }}
          api={formApi}
          chakra
          size="md"
        />

        <Box>
          {package_id ? (
            <Grid
              templateColumns="70px 1fr"
              color="font-secondary"
              fontSize="xs"
              gap={1}
            >
              <Text>Package ID</Text>
              <Text>{package_id}</Text>
            </Grid>
          ) : null}
        </Box>
        <Box>
          {deployment_id ? (
            <Grid
              templateColumns="100px 1fr"
              color="font-secondary"
              fontSize="xs"
              gap={1}
            >
              <Text>Deployment ID</Text>
              <Text>{deployment_id}</Text>
            </Grid>
          ) : null}
        </Box>
      </Flex>
      <Flex direction="column" gap={2} mt={5}>
        <Flex flexDir="column">
          <HStack>
            <Text color="tagMagenta">*</Text>
            <Text fontSize="md" fontWeight="medium" color="primary">
              Source and Target Environments
            </Text>
          </HStack>
          <Text fontSize="sm" color="font-secondary">
            Select the Source Environment from which you want to deploy objects
            to the Target Environment.
          </Text>
        </Flex>
        <Grid
          gap={1}
          alignItems="flex-start"
          templateColumns="260px min-content 260px"
        >
          <SelectComponent
            width="full"
            options={environments as any}
            name="env_id_src.$oid"
            controlId="source_environment"
            label="Source Environment"
            api={formApi}
            disabled={isDisabled}
            ariaLabel="env_id_src.$oid"
          />
          <Box>
            <Icon mt={7} as={ArrowNarrowRight} color="purple.100" w={5} h={5} />
          </Box>
          <SelectComponent
            width="full"
            options={environments as any}
            name="env_id_trg.$oid"
            controlId="target_environment"
            label="Target Environment"
            api={formApi}
            disabled={isDisabled}
            aria-label="env_id_trg.$oid"
            size="md"
          />
        </Grid>
      </Flex>
    </Grid>
  );
}

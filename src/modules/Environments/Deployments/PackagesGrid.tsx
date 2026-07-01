import { AppRoutes, paramsReplacer } from 'app/routes';
import {
  ButtonCreate,
  Center,
  Flex,
  HStack,
  NodeploymentsDefault,
  NoEntities,
  RiveryButton,
  Text,
} from 'components';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { useCore } from 'store/core';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { DeploymentsGridComponent } from './components/DeploymentGrid';
import { useResetAllQueryParams } from './components/helpers';
import './Deployments.scss';
import { useGetPackagesQuery, ViewTypes } from './packages.query';
import { SearchComponent } from './SearchComponent';

export function PackagesView({ onOpen, setPreparedPackage }) {
  const history = useHistory<any>();
  const { control } = useFormContext();
  const { environmentsLength } = useSelectedEnvironment();
  const resetAllQueryParams = useResetAllQueryParams();

  const filters = useWatch({
    control,
    name: ViewTypes.PACKAGES,
  });
  const { selectedAccountId: account, envId: env } = useCore();
  const { data, isFetching: loadingPackages } = useGetPackagesQuery(null);

  const packages = useMemo(() => {
    if (data) {
      if (filters?.package_name) {
        const filtered = data.filter(({ package_name }) =>
          package_name
            ?.toLowerCase()
            .includes(filters.package_name.toLowerCase()),
        );
        return [...filtered].reverse();
      }
      const reversed = [...data].reverse();
      return reversed;
    }
    return [];
  }, [data, filters]);

  const noPackages =
    !loadingPackages &&
    packages?.length === 0 &&
    ((filters && Object.values(filters).filter(Boolean).length === 0) ||
      !filters);

  const onAddPackage = useCallback(() => {
    resetAllQueryParams();
    onOpen('Add');
    setPreparedPackage(null);
  }, [onOpen, resetAllQueryParams, setPreparedPackage]);

  useEffectOnce(() => {
    if (history.location?.state?.addNew) {
      onAddPackage();
    }
  });
  const url = useCallback(
    path => paramsReplacer(path)({ account, env }),
    [account, env],
  );
  return (
    <Flex direction="column" overflow="hidden">
      <HStack
        alignItems="end"
        w="100%"
        borderBottom="1px"
        borderBottomColor="gray.300"
        pb={2}
      >
        <ButtonCreate
          aria-label="add package"
          mx="3px"
          mt="3px"
          onClick={onAddPackage}
          disabled={environmentsLength === 1}
          size="base"
        >
          Add Package
        </ButtonCreate>
        <SearchComponent
          allDisabled={noPackages}
          type={ViewTypes.PACKAGES}
          minW={300}
        />
      </HStack>
      {noPackages ? (
        <Center mt={12}>
          <NoEntities
            icon={NodeploymentsDefault}
            entity="Deployment Package"
            text={
              environmentsLength === 1 ? (
                <Flex alignItems="center" flexDir="column" gap={3}>
                  <Text>
                    Creating a Deployment Package can be done only after adding
                    another Environment.
                  </Text>
                  <Flex alignItems="center">
                    View our
                    <RiveryButton
                      fontSize="sm"
                      mx={1}
                      variant="link"
                      size="small"
                      label="documentation"
                      target="_blank"
                      href={import.meta.env.VITE_DOCS_LINK}
                    />
                    for help.
                  </Flex>
                  <ButtonCreate
                    size="small"
                    to={url(`${AppRoutes.ENVIRONMENTS}?tab=manager`)}
                    state={{ showAdd: true }}
                  >
                    Add Environment
                  </ButtonCreate>
                </Flex>
              ) : null
            }
          />
        </Center>
      ) : (
        <DeploymentsGridComponent
          setPreparedPackage={setPreparedPackage}
          type={ViewTypes.PACKAGES}
          list={packages}
          loading={loadingPackages}
          onOpenDrawer={onOpen}
        />
      )}
    </Flex>
  );
}

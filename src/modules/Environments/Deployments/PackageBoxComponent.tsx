import { Divider, Icon, Spinner } from '@chakra-ui/react';
import { AppRoutes, paramsReplacer } from 'app/routes';
import {
  Center,
  ChevronRight,
  ConfirmationModal,
  Draft,
  EnvironmentsIcon,
  Flex,
  HStack,
  OutlinedSuccess,
  Revert,
  RocketOutlineIcon,
  SuccessIcon,
  Text,
  WarningCircle,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { getQueryParams, useSetQueryParams } from 'hooks/router';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useMemo } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { displayDate } from 'utils/date.utils';
import { useGetEnvironmentsQuery } from '../environments.query';
import { pollResponse, usePreparePackage } from './components/helpers';
import './Deployments.scss';
import {
  useDeletePackageMutation,
  useGetPackagesQuery,
  useRevertPackageMutation,
} from './packages.query';

function PackageNameWrapper({ children, onOpenDrawer, isPackageDeleted }) {
  const packageId = getQueryParams(['package_id']);
  const inlineView = Boolean(packageId.package_id);
  return (
    <HStack>
      {inlineView || isPackageDeleted ? (
        isPackageDeleted ? (
          <HStack maxW="220px">
            {children} <Text color="font-secondary">(Deleted)</Text>
          </HStack>
        ) : (
          children
        )
      ) : (
        <RiveryButton
          pl="0"
          variant="link"
          onClick={onOpenDrawer}
          label={children}
        />
      )}
    </HStack>
  );
}

function PackageName({
  isDeployed = false,
  id,
  package_name,
  icon,
  statusDescription,
  iconColor = '',
  onOpenDrawer = null,
}) {
  const { data: packages } = useGetPackagesQuery(null);
  const isPackageDeleted =
    !isDeployed && !packages?.find(({ _id }) => id === getOId(_id));

  return (
    <Flex
      direction="column"
      flex={2}
      py={2}
      px={4}
      gap={2}
      borderRight="1px solid"
      borderRightColor="gray.300"
    >
      <PackageNameWrapper
        onOpenDrawer={onOpenDrawer}
        isPackageDeleted={isPackageDeleted}
      >
        <Text
          textAlign="left"
          w="230px"
          fontSize="md"
          fontWeight="medium"
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
          title={package_name}
          id="package_name"
        >
          {package_name ?? 'Undefined'}
        </Text>
      </PackageNameWrapper>
      <HStack>
        <Icon as={icon} color={iconColor} boxSize={4} />
        <Text {...{ ml: '0.25rem!important' }}>{statusDescription}</Text>
      </HStack>
    </Flex>
  );
}

const useActiveEnv = name => {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  return environmentsArray?.find(compare('environment_name', name));
};

const useDisplayEnvName = name => {
  const { selectedAccountId: account } = useCore();
  const currentEnv = useActiveEnv(name);

  const url = useCallback(
    path =>
      paramsReplacer(path)({ account, env: getOId(currentEnv?.cross_id) }),
    [account, currentEnv?.cross_id],
  );
  if (name) {
    if (Boolean(currentEnv)) {
      return (
        <RiveryButton
          label={name}
          variant="text-link"
          textDecoration="none"
          p={0}
          fontSize="inherit"
          onClick={() => window.open(url(AppRoutes.RIVERS))}
        />
      );
    }
    return (
      <HStack>
        <Text>{name}</Text>
        {name !== 'Public Kits' && (
          <Text fontWeight="normal" color="font-secondary">
            (Deleted)
          </Text>
        )}
      </HStack>
    );
  }
  return 'N/A';
};
const entitiesArray = [
  { name: 'rivers', display: 'Data Flows' },
  { name: 'connections', display: 'Connections' },
  { name: 'dataframes', display: 'Dataframes' },
  { name: 'variables', display: 'Variables' },
  { name: 'river_groups', display: 'Groups' },
  { name: 'recipes', display: 'Blueprints' },
];

function PackageEntities({ env_src_name, env_trg_name, entities_total }) {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const { isSuperAdminUser } = useCore();

  const entities = useMemo(() => {
    return isSuperAdminUser
      ? entitiesArray.concat({ name: 'templates', display: 'Kits' })
      : entitiesArray;
  }, [isSuperAdminUser]);

  const entitiesDisplay =
    entities_total &&
    entities?.sort(
      (a: any, b: any) =>
        Object.entries(entities_total)?.indexOf(a.name) -
        Object.entries(entities_total)?.indexOf(b.name),
    );
  const src_env = environmentsArray?.find(
    compare('environment_name', env_src_name),
  );
  const trg_env = environmentsArray?.find(
    compare('environment_name', env_trg_name),
  );
  return (
    <Flex
      direction="column"
      py={2}
      px={6}
      gap={2}
      flex={5}
      borderRight="1px solid"
      borderRightColor="gray.300"
    >
      <HStack>
        <HStack>
          <Icon as={EnvironmentsIcon} color={src_env?.color} boxSize={4} />
          <Text fontSize="md" fontWeight="medium">
            {useDisplayEnvName(env_src_name)}
          </Text>
        </HStack>
        <Icon as={ChevronRight} color="font-secondary" />
        <HStack>
          <Icon as={EnvironmentsIcon} color={trg_env?.color} boxSize={4} />
          <Text fontSize="md" fontWeight="medium">
            {useDisplayEnvName(env_trg_name)}
          </Text>
        </HStack>
      </HStack>
      {entities_total ? (
        <HStack>
          {entitiesDisplay?.map(({ name, display }) => {
            return entities_total[name] ? (
              <HStack
                key={name}
                borderRight="1px solid"
                borderRightColor="gray.300"
                pr={2}
                color="font"
              >
                <Text textTransform="capitalize">{display}</Text>
                <Text>{entities_total[name]}</Text>
              </HStack>
            ) : null;
          })}
        </HStack>
      ) : null}
    </Flex>
  );
}

function PackageActions({
  updated_at,
  updated_by_name,
  isDeployed = false,
  actions = null,
  showDivider = false,
}) {
  return (
    <Flex
      alignItems="center"
      py={1}
      px={4}
      flex={3}
      minWidth="250px"
      position="relative"
      justifyContent="space-between"
    >
      <Flex direction="column" fontSize="xs" gap={0.5}>
        <Text color="font-secondary">
          {isDeployed ? 'Deployed on' : 'Last Modified'}
        </Text>
        <Text>{displayDate(updated_at?.$date, 'dd-MMM-yy, HH:mm')}</Text>
        <HStack>
          <Text>By</Text>
          <Text>{updated_by_name ?? 'N/A'}</Text>
        </HStack>
      </Flex>
      {showDivider ? <Divider h="50px" orientation="vertical" /> : null}
      {actions}
    </Flex>
  );
}

export function PackageBox({
  _id,
  package_name,
  env_src_name,
  env_trg_name,
  entities_total,
  updated_at,
  updated_by_name,
  onOpenDrawer,
  setPreparedPackage,
}) {
  const setQueryParams = useSetQueryParams();
  const hasSrc =
    Boolean(useActiveEnv(env_src_name)) || env_src_name === 'Public Kits';
  const hasTrgt = Boolean(useActiveEnv(env_trg_name));
  const readyToDeploy =
    entities_total &&
    Object.values(entities_total)?.length > 0 &&
    hasSrc &&
    hasTrgt;

  const setEdit = useCallback(() => {
    onOpenDrawer('Edit');
    setQueryParams({ package_id: getOId(_id) });
  }, [_id, onOpenDrawer, setQueryParams]);
  const { error } = useToastComponent();
  const [show, toggle] = useToggle(false);
  const [isDeploying, setDeploying] = useToggle(false);
  const [deletePackage] = useDeletePackageMutation();
  const menuItems = [
    {
      ...RiveryDropdown.EditMenuItem,
      onClick: setEdit,
    },
    {
      ...RiveryDropdown.DeleteMenuItem,
      onClick: toggle,
    },
  ];

  const showError = useCallback(
    description => {
      error({ description });
      setDeploying(false);
    },
    [error, setDeploying],
  );

  const preparePackage = usePreparePackage(setPreparedPackage, showError);

  const deployPackage = useCallback(async () => {
    setDeploying(true);
    await preparePackage(getOId(_id));
    return;
  }, [_id, preparePackage, setDeploying]);

  return (
    <Flex
      borderRadius={4}
      borderWidth="1px"
      mt={2}
      minWidth={1000}
      sx={{
        _hover: {
          bg: 'background-secondary',
        },
      }}
    >
      <PackageName
        id={getOId(_id)}
        package_name={package_name}
        icon={readyToDeploy ? OutlinedSuccess : Draft}
        iconColor={readyToDeploy ? 'green.200' : 'red.200'}
        statusDescription={readyToDeploy ? 'Ready for deployment' : 'Draft'}
        onOpenDrawer={setEdit}
      />
      <PackageEntities
        env_src_name={env_src_name}
        env_trg_name={env_trg_name}
        entities_total={entities_total}
      />
      <PackageActions
        updated_at={updated_at}
        updated_by_name={updated_by_name}
        actions={
          <Flex
            justify="flex-end"
            alignItems="center"
            position="absolute"
            right={0}
            top={6}
          >
            {readyToDeploy ? (
              <RiveryButton
                label="Deploy"
                size="small"
                variant="outlined-primary"
                leftIcon={<Icon as={RocketOutlineIcon} />}
                onClick={deployPackage}
                isLoading={isDeploying}
              />
            ) : null}
            <RiveryDropdown
              menuItems={menuItems}
              useAsPortal={true}
              menuButtonAriaLabel={'package-actions'}
            />
          </Flex>
        }
      />
      <ConfirmationModal
        show={show}
        onClose={toggle}
        onConfirm={() => deletePackage(getOId(_id))}
        title={`Delete "${package_name}" Package?`}
        description="Removes the package for all users."
        variant="warning"
        confirmLabel="Delete"
      />
    </Flex>
  );
}

enum StatusMap {
  REVERT = 'Revert',
  DEPLOY = 'Deploy',
}

function StatusSpinner() {
  return <Spinner color="background-deselected" boxSize={3} />;
}

const IconDescriptionMap = {
  [StatusMap.DEPLOY]: {
    succeeded: {
      icon: SuccessIcon,
      color: 'green.200',
      description: 'Deployed successfully',
    },
    failed: {
      icon: WarningCircle,
      color: 'red.200',
      description: 'Failed to deploy',
    },
    deploying: {
      icon: StatusSpinner,
      description: 'Deploying',
    },
  },
  [StatusMap.REVERT]: {
    succeeded: {
      icon: Revert,
      color: 'primary',
      description: 'Reverted successfully',
    },
    failed: {
      icon: Revert,
      color: 'red.200',
      description: 'Failed to revert',
    },
    reverting: {
      icon: StatusSpinner,
      description: 'Reverting',
    },
  },
};

export function ActivityBox({
  package_name,
  package_id,
  deployment_id,
  deployment_status,
  env_src_name,
  env_trg_name,
  entities_total_deployed,
  deployed_at,
  reverted_at,
  deployed_by_name,
  reverted_by_name,
  onRevertDeployment,
  onOpenDrawer,
  ...rest
}) {
  const setQueryParams = useSetQueryParams();
  const type = 'revert_status' in rest ? StatusMap.REVERT : StatusMap.DEPLOY;
  const status =
    type === StatusMap.REVERT ? rest.revert_status : deployment_status;
  const [showModal, toggleConfirmationModal] = useToggle(false);
  const [revert] = useRevertPackageMutation();
  const { error } = useToastComponent();
  const showError = useCallback(description => error({ description }), [error]);

  const revertDeployment = useCallback(async () => {
    const res: any = await revert(deployment_id);
    pollResponse({
      id: getOId(res.data._id),
      successCB: onRevertDeployment,
      errorCB: showError,
    });
    onRevertDeployment();
  }, [deployment_id, onRevertDeployment, revert, showError]);

  const setViewMode = useCallback(() => {
    onOpenDrawer('View');
    setQueryParams({ package_id, mode: 'view' });
    setQueryParams({ deployment_id, mode: 'view' });
  }, [deployment_id, onOpenDrawer, package_id, setQueryParams]);

  const initials =
    reverted_by_name
      ?.split(' ')
      .map(string => string.substring(0, 1))
      .join('') ?? 'N/A';

  const hasReverted = type === StatusMap.REVERT && status === 'succeeded';

  return (
    <Flex
      borderRadius={4}
      borderWidth="1px"
      my={2}
      minWidth={1200}
      sx={{
        _hover: {
          bg: 'background-secondary',
          '& #package_name': { color: 'primary', textDecoration: 'underline' },
        },
      }}
    >
      <PackageName
        isDeployed
        id={package_id}
        package_name={package_name}
        icon={IconDescriptionMap[type][status]?.icon}
        iconColor={IconDescriptionMap[type][status]?.color}
        statusDescription={IconDescriptionMap[type][status]?.description}
        onOpenDrawer={setViewMode}
      />
      <PackageEntities
        env_src_name={env_src_name}
        env_trg_name={env_trg_name}
        entities_total={entities_total_deployed}
      />

      <PackageActions
        showDivider={hasReverted}
        isDeployed={true}
        updated_at={deployed_at}
        updated_by_name={deployed_by_name}
        actions={
          hasReverted ? (
            <Flex direction="column" fontSize="xs" gap={0.5}>
              <Text color="font-secondary">Reverted on</Text>
              <Text>{displayDate(reverted_at?.$date, 'dd-MMM-yy, HH:mm')}</Text>
              <HStack>
                <Text color="font-secondary">By</Text>
                <Center
                  fontSize="10px"
                  w={5}
                  h={5}
                  borderRadius={50}
                  bgColor="background-secondary"
                  textTransform="uppercase"
                >
                  {initials}
                </Center>
                <Text>{reverted_by_name ?? 'N/A'}</Text>
              </HStack>
            </Flex>
          ) : (
            <Flex
              justify="flex-end"
              alignItems="center"
              position="absolute"
              right={4}
              top={6}
            >
              {type === StatusMap.REVERT ||
              deployment_status === 'failed' ? null : (
                <RiveryButton
                  label="Revert"
                  size="small"
                  variant="outlined-primary"
                  leftIcon={<Icon as={Revert} />}
                  onClick={toggleConfirmationModal}
                  disabled={
                    deployment_status === 'deploying' ||
                    rest.revert_status === 'reverting'
                  }
                />
              )}
            </Flex>
          )
        }
      />
      <ConfirmationModal
        show={showModal}
        onClose={toggleConfirmationModal}
        confirmLabel="Revert"
        variant="warning"
        onConfirm={revertDeployment}
        title={`Revert "${package_name}" Package?`}
      >
        <Flex flexDir="column">
          <Text>
            This action will restore the current environment to the state it was
            in prior to the deployment of the package {package_name} on
            {displayDate(deployed_at?.$date, 'dd-MMM-yy, HH:mm')}.
          </Text>
          <Text>
            All included Data Flows and Groups will be restored to their prior
            state as well.{' '}
          </Text>
          <Text>The Connections and Variables will remain the same.</Text>
        </Flex>
      </ConfirmationModal>
    </Flex>
  );
}

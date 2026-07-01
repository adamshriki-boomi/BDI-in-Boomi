import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { Slide, TextProps } from '@chakra-ui/react';
import { AppRoutes, paramsReplacer } from 'app/routes';
import {
  Box,
  ButtonCreate,
  Center,
  Divider,
  EnvironmentsIcon,
  Flex,
  Grid,
  Icon,
  RiveryButton,
  RiveryInfoTooltip,
  Text,
} from 'components';
import { InputSearch } from 'components/Form';
import { getQueryParams } from 'hooks/router';
import { ScopesGuard } from 'hooks/useAllowedScopes';
import { navigateCallback, useNextRouteResolver } from 'modules';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useCallback, useMemo, useState } from 'react';
import { useCore } from 'store/core';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { getOId } from 'utils/api.sanitizer';
import { DrawerType } from '../common';
import { FadingText, SideBarElement } from './SubComponents';

export const ActiveAccountName = (props?: TextProps) => {
  const { activeAccountName } = useCore();
  return (
    <Text
      textStyle="R8"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      textAlign="left"
      {...props}
    >
      {activeAccountName}
    </Text>
  );
};

export function EnvironmentView({ isOpen, setDrawer, drawerType }) {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  const { selectedEnv, name, color, hoverColor, iconColor } =
    useSelectedEnvironment();
  return selectedEnv ? (
    <SideBarElement
      cursor="pointer"
      aria-label="environment account selector"
      color="brand"
      pr={3}
      showArrow={isOpen}
      onClick={() =>
        drawerType === DrawerType.ENVIRONMENTS
          ? setDrawer(null)
          : setDrawer(DrawerType.ENVIRONMENTS)
      }
      minHeight="55px"
      maxHeight="55px"
      isOpen={isOpen}
      displayTooltip={drawerType !== DrawerType.ENVIRONMENTS}
      as={Box}
      _hover={{ bg: hoverColor }}
      bg={color}
      icon={
        <Icon
          bg={exoTheme ? iconColor : 'brand'}
          as={EnvironmentsIcon}
          color={color}
          boxSize="18px"
          p="2px"
          mb={-5}
          borderRadius={50}
        />
      }
      description={name}
      text={
        isOpen ? (
          <Grid>
            <ActiveAccountName />
            <FadingText
              isOpen={isOpen}
              text={name}
              color="brand"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              w="120px"
              fontWeight="600"
            />
          </Grid>
        ) : (
          <Box mb="24px !important" ml="-32px !important">
            <ActiveAccountName w="45px" />
          </Box>
        )
      }
    />
  ) : (
    <Center h="full">
      <ExLoader size={LoaderSize.MEDIUM} />
    </Center>
  );
}

export function EnvSelection({ setDrawer }) {
  const { selectedAccountId } = useCore();
  const [filter, setFilter] = useState('');
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const { name: selectedEnvName } = useSelectedEnvironment();
  const { createUrl } = useNextRouteResolver();
  const { selected_river_type } = getQueryParams(['selected_river_type']);
  const params = selected_river_type
    ? `?selected_river_type=${selected_river_type}`
    : '';

  const getEnvUrl = env => () =>
    `${createUrl(selectedAccountId, env)}${params}`;

  const visibleEnvs = useMemo(() => {
    if (filter) {
      return environmentsArray.filter(({ environment_name }) =>
        environment_name.toLowerCase().includes(filter.toLowerCase()),
      );
    }
    return environmentsArray;
  }, [environmentsArray, filter]);
  return (
    <Slide
      direction="left"
      in
      style={{ height: 'full', position: 'relative', overflow: 'auto' }}
    >
      <Grid
        templateRows="auto 1fr auto"
        pt={3}
        px={4}
        gap={2}
        h="full"
        overflow="auto"
      >
        <Grid>
          <Text textStyle="R8" color="primaryLighter">
            Environments
          </Text>
          <InputSearch
            onChange={e => setFilter(e.target.value)}
            size="md"
            placeholder="Search Environment..."
            chakra
            value={filter}
          />
        </Grid>
        <Flex overflowY="auto" overflowX="hidden" flexDir="column" gap={3}>
          {visibleEnvs?.map(env => (
            <Flex
              w="full"
              flexDir="column"
              key={`${env.environment_name}`}
              gap={3}
            >
              <RiveryButton
                onClick={navigateCallback(getEnvUrl(getOId(env._id)))}
                isActive={selectedEnvName === env.environment_name}
                w="full"
                height="44px"
                p={1}
                variant="accountSelector"
                leftIcon={
                  <Icon
                    as={EnvironmentsIcon}
                    color="background-secondary"
                    bg={env.color}
                    borderRadius={50}
                    boxSize={4}
                    p={0.5}
                    ml={1}
                  />
                }
                label={
                  <Text variant="textEllipsis">{env.environment_name}</Text>
                }
                justifyContent="start"
              />
              <Divider dir="horizontal" w="full" bg="gray.300" />
            </Flex>
          ))}
        </Flex>
        <Flex
          flexDir="column"
          justify="center"
          borderTop="1px"
          borderColor="gray.300"
          py={3}
        >
          <Box ml="auto">
            <CreateEnvButton setDrawer={setDrawer} />
          </Box>
        </Flex>
      </Grid>
    </Slide>
  );
}

function CreateEnvButton({ setDrawer }) {
  const { environmentsLength: total } = useSelectedEnvironment();
  const {
    selectedAccountId: account,
    envId: env,
    accountSettings: { max_allowed_environments },
  } = useCore();
  const url = useCallback(
    path => paramsReplacer(path)({ account, env }),
    [account, env],
  );
  const maximumReached =
    max_allowed_environments && total >= max_allowed_environments;
  return (
    <ScopesGuard scopes={['environment:edit']}>
      <OverlayWrapper maxReached={maximumReached}>
        <ButtonCreate
          size="small"
          variant="outlined-primary"
          to={url(`${AppRoutes.ENVIRONMENTS}?tab=manager`)}
          state={{ showAdd: true }}
          disabled={maximumReached}
          extraAction={() => setDrawer(null)}
        >
          Add Environment
        </ButtonCreate>
      </OverlayWrapper>
    </ScopesGuard>
  );
}

function OverlayWrapper({ children, maxReached }) {
  return maxReached ? (
    <RiveryInfoTooltip
      icon={children}
      buttonProps={{ size: 'small' }}
      description="You have reached the maximum number of environments for your account type."
    />
  ) : (
    children
  );
}

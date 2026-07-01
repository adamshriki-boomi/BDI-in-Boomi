import { Box, ListItem, OrderedList } from '@chakra-ui/react';
import { AppRoutes, paramsReplacer } from 'app/routes';
import {
  CloseIconButton,
  DateDisplay,
  Flex,
  HStack,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { CustomSelectForm } from 'components/Form';
import { useGetTokensQuery } from 'containers/Settings/Tokens/tokens.query';
import { useEnvironmentOptions } from 'modules/Environments/components/EnvironmentsSelector';
import { default as React, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';

const alerts = {
  environments: 'all secondary Environments will be deleted',
  tokens: 'your existing API Tokens will be revoked',
};

// TODO remove legacy pricing (whole page)
export function StarterLimitationContent({
  toggleModal,
  openHelpModal,
  openConfirmationModal,
  togglePricingModal,
}) {
  const { selectedAccountId: account, envId: env } = useCore();

  const environments = useEnvironmentOptions();
  const { data: tokens } = useGetTokensQuery(null);

  const history = useHistory();
  const url = useCallback(
    tab =>
      paramsReplacer(`${AppRoutes.ENVIRONMENTS}?tab=${tab}`)({ account, env }),
    [account, env],
  );
  const goToEnvironments = useCallback(
    tab => {
      history.push(url(tab));
      toggleModal();
    },
    [history, toggleModal, url],
  );

  const [selectedEnv, setSelectedEnv] = useState(null);
  return (
    <ModalContent maxW="lg">
      <ModalHeader py={2}>
        <HStack justify="space-between">
          <Text textStyle="M6">
            Thanks for subscribing to the Boomi starter plan
          </Text>
          <CloseIconButton
            onClick={toggleModal}
            aria-label="close"
            p={0}
            minW="0px!important"
          />
        </HStack>
      </ModalHeader>
      <ModalBody>
        <Text>
          Our Starter Plan offers unlimited Data Sources, Destinations,
          Orchestration, and more.
          <RenderGuard condition={environments?.length > 1}>
            {' '}
            However, this plan <strong>does not include</strong> managing{' '}
            <strong>multiple Environments</strong>
            <RenderGuard condition={Boolean(tokens)}>
              {' '}
              and utilizing <strong>the Boomi Data Integration API</strong>
            </RenderGuard>
            .
          </RenderGuard>
          <RenderGuard
            condition={environments?.length === 1 && Boolean(tokens)}
          >
            <br />
            However, this plan <strong>does not include</strong> access to
            <strong> the Boomi Data Integration API</strong>.
          </RenderGuard>
          <br />
          <RenderGuard condition={environments?.length > 1}>
            <Box pt={2}>
              If you wish to manage more than a single environment we recommend
              one of the following to ensure your work will continue seamlessly:
            </Box>
          </RenderGuard>
          <RenderGuard
            condition={environments?.length === 1 && Boolean(tokens)}
          >
            <Flex flexDir="column">
              <Box py={2}>
                If you wish to keep using the Boomi Data Integration API and
                more benefits, you’ll need to upgrade to{' '}
                <strong>the Boomi Professional Plan </strong>.
              </Box>
              <Alert text={alerts.tokens} />
            </Flex>
          </RenderGuard>
        </Text>
        <RenderGuard condition={environments?.length > 1}>
          <OrderedList pt={3}>
            <ListItem>
              <Flex flexDir="column" gap={2}>
                <Box>
                  Stay on the Starter Plan, select the Environment you would
                  like to work in, and{' '}
                  <RiveryButton
                    label="deploy"
                    variant="link"
                    onClick={() => goToEnvironments('deployments')}
                  />{' '}
                  all the entities you want to keep to that default Environment.
                </Box>
                <CustomSelectForm
                  options={environments as any}
                  name="default-env-selector"
                  controlId="default-env-selector"
                  ariaLabel="default-env-selector"
                  onChange={(option: any) => setSelectedEnv(option.value)}
                  label="Select your default Environment"
                  isMulti={false}
                />
              </Flex>
            </ListItem>
            <ListItem mt={6}>
              <Box>
                Upgrade to the Boomi <strong>Professional Plan</strong> and
                benefit from access to{' '}
                <RenderGuard condition={Boolean(tokens)}>
                  the Boomi Data Integration API,
                </RenderGuard>{' '}
                two Environments and many more capabilities.
              </Box>
            </ListItem>
          </OrderedList>
          <Box pt={3}>
            <Alert
              text={
                Boolean(tokens)
                  ? `${alerts.tokens} and ${alerts.environments}.`
                  : `${alerts.environments}`
              }
            />
          </Box>
        </RenderGuard>
      </ModalBody>
      <ModalFooter py="10px !important">
        <HStack w="full" justify="space-between">
          <RiveryButton
            label="Contact for Help"
            variant="text-link"
            onClick={openHelpModal}
          />
          <HStack>
            <RiveryButton
              variant="default"
              label="Upgrade Now"
              onClick={() => togglePricingModal(true)}
            />
            <RenderGuard condition={environments?.length > 1}>
              <RiveryButton
                disabled={!selectedEnv}
                label="Apply Selection"
                onClick={() => openConfirmationModal(selectedEnv)}
              />
            </RenderGuard>
          </HStack>
        </HStack>
      </ModalFooter>
    </ModalContent>
  );
}

function Alert({ text }) {
  const { starterPlanLimitations } = useCore();
  return (
    <RiveryAlert
      variant="warning-light"
      description={
        <Box>
          Please note that if no action is taken by{' '}
          <DateDisplay
            value={starterPlanLimitations.expDate}
            display="inline"
          />{' '}
          , {text}
        </Box>
      }
    />
  );
}

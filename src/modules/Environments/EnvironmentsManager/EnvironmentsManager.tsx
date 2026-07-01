import { PlansIds } from 'api/types';
import { Box, ButtonCreate, Flex, HStack, Text } from 'components';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { TabContent } from '../components/TabContent';
import { useGetEnvironmentsQuery } from '../environments.query';
import { EnvironmentsTags } from 'utils/tracking.tags';
import {
  useAddEnvironment,
  useDeleteEnvironment,
  useEditEnvironment,
} from '../helpers';
import { EnvironmentBox } from './EnvironmentBox';

export function EnvironmentsManager() {
  const {
    accountSettings: { max_allowed_environments },
    plan,
  } = useCore();
  const isBase = [
    PlansIds.STARTER,
    PlansIds.STARTER_ANNUAL,
    PlansIds.BASE_2025,
  ].includes(plan); // TODO remove legacy pricing - keep only base
  const { data: environmentsArray, isLoading } = useGetEnvironmentsQuery('');
  const total = environmentsArray?.length;
  const { addEnvironment, adding } = useAddEnvironment();
  const { editEnvironment, editing } = useEditEnvironment();
  const { deleteEnvironment, deleting } = useDeleteEnvironment();
  const [newBox, toggleNewBox] = useToggle(false);
  const [upgradeModal, toggleUpgradeModal] = useToggle(false);
  const [filterValue, setFilterValue] = useState('');
  const history: any = useHistory();

  const maximumReached =
    max_allowed_environments && total >= max_allowed_environments;
  const addEnv = () => {
    if (maximumReached) {
      toggleUpgradeModal(true);
    } else {
      toggleNewBox(true);
    }
  };
  useEffect(() => {
    if (history.location.state?.showAdd && !maximumReached) {
      toggleNewBox(true);
    }
  }, [history.location.state?.showAdd, maximumReached, toggleNewBox]);

  return (
    <TabContent loading={isLoading || adding || editing || deleting}>
      <EnableFeatureModal
        feature={isBase ? 'baseEnv' : 'professionalEnv'}
        show={upgradeModal}
        toggle={toggleUpgradeModal}
      />
      <HStack justifyContent="space-between">
        <Text fontSize="sm" color="font-secondary">
          Create and manage your environments
        </Text>

        <Flex>
          <HStack mr={3}>
            <Text>{total}</Text>
            {max_allowed_environments ? (
              <Text color="font-secondary" {...{ ml: '0!important' }}>
                /{max_allowed_environments}
              </Text>
            ) : (
              <Text color="font-secondary">environments</Text>
            )}
          </HStack>
          <ButtonCreate
            mt="3px"
            mr="3px"
            aria-label="Add environment"
            onClick={addEnv}
            data-pendo-id={EnvironmentsTags.ADD_ENVIRONMENT_BUTTON}
          >
            Add Environment
          </ButtonCreate>
        </Flex>
      </HStack>
      <Box>
        <TableFilter
          name="search-environment"
          value={filterValue}
          onFilterChange={setFilterValue}
          label="Search Environments"
          chakra
          data-pendo-id={EnvironmentsTags.SEARCH_INPUT}
        />
      </Box>
      <Box overflow="auto" maxHeight={window.outerHeight - 100}>
        {newBox && (
          <EnvironmentBox
            clearNewBox={toggleNewBox}
            action={addEnvironment}
            open
          />
        )}
        {environmentsArray?.map((env, idx) =>
          !filterValue ||
          env.environment_name
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ? (
            <EnvironmentBox
              key={env.environment_name}
              env={env}
              action={editEnvironment}
              deleteEnv={deleteEnvironment}
            />
          ) : null,
        )}
      </Box>
    </TabContent>
  );
}

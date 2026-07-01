import { Flex, useBoolean } from '@chakra-ui/react';
import { ITeam } from 'api/types';
import { Text } from 'components';
import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createSearchParam, parseSearchParams } from 'utils/searchParams';
import { TeamsDrawer } from './TeamsDrawer';
import TeamsGrid from './TeamsGrid';

export function TeamsTab() {
  const {
    replace,
    location: { pathname },
  } = useHistory();

  const [showTeamsForm, toggleTeamsForm] = useBoolean(false);
  const [selectedTeam, setSelectedTeam] = useState<ITeam>(null);
  const params = parseSearchParams();
  const changeTeam = useCallback(
    team => {
      replace({
        pathname,
        search: createSearchParam({ ...params, team_id: team._id }),
      });
      setSelectedTeam(team);
      toggleTeamsForm.on();
    },
    [params, pathname, replace, toggleTeamsForm],
  );

  const dismissDrawer = useCallback(() => {
    replace({ search: createSearchParam({ ...params, team_id: null }) });
    toggleTeamsForm.off();
    setSelectedTeam(null);
  }, [params, replace, toggleTeamsForm]);

  return (
    <Flex flexDir="column" gap={2} overflow="hidden" h="100%">
      <Text color="font-secondary">Manage your Teams</Text>
      <TeamsGrid setSelectedTeam={changeTeam} />
      <TeamsDrawer
        team={selectedTeam}
        show={showTeamsForm}
        onClose={dismissDrawer}
      />
    </Flex>
  );
}

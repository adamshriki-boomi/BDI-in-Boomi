import {
  CloseIconButton,
  DeleteIcon,
  Divider,
  Grid,
  Icon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { useCallback } from 'react';
import { useCore } from 'store/core';
import { useUpdateMultipleTeamsMutation } from '../../teams.query';

export default function BulkActions({ teams, setTeamsForBulk }) {
  const { activeAccountId: account } = useCore();
  const [updateTeams] = useUpdateMultipleTeamsMutation();
  const onDeleteTeam = useCallback(() => {
    updateTeams({ body: { is_imported: false }, team_ids: teams, account });
    setTeamsForBulk([]);
  }, [account, setTeamsForBulk, teams, updateTeams]);
  return (
    <RenderGuard condition={teams.length > 0}>
      <Grid
        alignSelf="center"
        alignItems="center"
        templateColumns="3fr min-content 2fr min-content min-content"
        bg="primary"
        h="45px"
        w="280px"
        position="absolute"
        bottom={50}
        boxShadow="0px 2px 4px -2px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)"
        borderRadius={4}
        color="font-inverse"
        gap={3}
        px={4}
        textStyle="M8"
      >
        <Text>{teams?.length} Items Selected</Text>
        <Divider h="20px" orientation="vertical" bg="inherit" />
        <RiveryButton
          label="Delete"
          leftIcon={<Icon as={DeleteIcon} mb={0.5} />}
          variant="text"
          p={0}
          color="inherit"
          size="small"
          onClick={onDeleteTeam}
          _hover={{ bg: 'primary' }}
          _active={{ bg: 'primary' }}
        />
        <Divider h="20px" orientation="vertical" />
        <CloseIconButton
          aria-label="unselect-teams"
          boxSize={4}
          minW={4}
          onClick={() => setTeamsForBulk([])}
        />
      </Grid>
    </RenderGuard>
  );
}

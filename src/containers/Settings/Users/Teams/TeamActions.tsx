import { ConfirmationModal, EditIcon, Flex, Icon, Text } from 'components';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useUpdateTeamMutation } from '../teams.query';

function TeamsActionsMenuItem({ text, icon }) {
  return (
    <Flex alignItems="center">
      <Icon as={icon} boxSize="18px" mr={2} mb={0.5} />
      <Text>{text}</Text>
    </Flex>
  );
}

export default function TeamActions({
  row: { original },
  row,
  column: { getProps },
}) {
  const { activeAccountId: account } = useCore();
  const { success } = useToastComponent();
  const [showConfirmationModal, toggleConfirmationModal] = useToggle(false);
  const [updateTeam, { isSuccess }] = useUpdateTeamMutation();
  const onConfirmDelete = useCallback(() => {
    const { remote_display_name, source, ...team } = original;
    updateTeam({ ...team, is_imported: false, account });
  }, [account, original, updateTeam]);
  const actions = [
    {
      value: <TeamsActionsMenuItem text="Edit" icon={EditIcon} />,
      onClick: () => getProps?.setSelectedTeam(row?.original),
    },
    // {
    //   value: <TeamsActionsMenuItem text="Delete" icon={DeleteIcon} />,
    //   onClick: () => toggleConfirmationModal(true),
    // },
  ].filter(Boolean);

  useEffect(() => {
    if (isSuccess) {
      success({ description: 'Team deleted successfully' });
    }
  });

  return (
    <>
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={toggleConfirmationModal}
        onConfirm={onConfirmDelete}
        title={<Text textTransform="capitalize">Delete Team</Text>}
        variant="error"
        confirmLabel="Delete"
        confirmColorScheme="danger"
      >
        This action will permanently delete the team <br />
        and the users associated with it.
      </ConfirmationModal>
      <RiveryDropdown
        isLazy
        menuItems={actions}
        menuButtonAriaLabel={`teams-menu-${row.id}`}
        useAsPortal
      />
    </>
  );
}

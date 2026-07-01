import {
  ConfirmationModal,
  DeleteIcon,
  EditIcon,
  Flex,
  Icon,
  Text,
} from 'components';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect } from 'react';
import { useToggle } from 'react-use';
import { useDeleteBlueprintMutation } from '../blueprints.query';
import { useHistory } from 'react-router-dom';
import { upsertSearchParam } from '../../../utils/searchParams';

function BlueprintActionsMenuItem({ text, icon }) {
  return (
    <Flex alignItems="center">
      <Icon as={icon} boxSize="18px" mr={2} mb={0.5} color="icon-tertiary" />
      <Text>{text}</Text>
    </Flex>
  );
}

export default function BlueprintActions({ row }) {
  const { replace } = useHistory();

  const setSelectedBlueprint = useCallback(
    id => replace({ search: upsertSearchParam('blueprint', id) }),
    [replace],
  );
  const [showConfirmationModal, toggleConfirmationModal] = useToggle(false);
  const { deleteBlueprintAction } = useDeleteBlueprint();
  const onConfirmDelete = useCallback(
    () => deleteBlueprintAction(row?.original?.cross_id),
    [deleteBlueprintAction, row?.original?.cross_id],
  );
  const actions = [
    {
      value: <BlueprintActionsMenuItem text="Edit" icon={EditIcon} />,
      onClick: () => setSelectedBlueprint(row?.original?.cross_id),
    },
    {
      value: <BlueprintActionsMenuItem text="Delete" icon={DeleteIcon} />,
      onClick: () => toggleConfirmationModal(true),
    },
  ].filter(Boolean);

  return (
    <>
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={toggleConfirmationModal}
        onConfirm={onConfirmDelete}
        title={<Text textTransform="capitalize">Delete Blueprint</Text>}
        variant="error"
        confirmLabel="Delete"
        confirmColorScheme="danger"
      >
        This action will permanently delete this blueprint
      </ConfirmationModal>
      <RiveryDropdown
        isLazy
        menuItems={actions}
        menuButtonAriaLabel={`blueprint-menu-${row.id}`}
        useAsPortal
      />
    </>
  );
}

const useDeleteBlueprint = () => {
  const { success } = useToastComponent();
  const [deleteBlueprint, { isSuccess }] = useDeleteBlueprintMutation();
  useEffect(() => {
    if (isSuccess) {
      success({ description: 'Blueprint deleted successfully' });
    }
  });
  const deleteBlueprintAction = useCallback(
    id => deleteBlueprint({ id }),
    [deleteBlueprint],
  );
  return { deleteBlueprintAction };
};

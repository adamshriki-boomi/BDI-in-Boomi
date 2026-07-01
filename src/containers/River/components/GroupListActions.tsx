import { ConfirmationModal } from 'components';
import React, { useEffect } from 'react';
import { useToggle } from 'react-use';
import RiveryDropdown from '../RiverLogic/Logic/components/RiveryChakraMenu';
import { Groups } from './Groups';
import { useGroups } from './Groups/useGroups';

export function GroupListActions({
  row: {
    original: {
      name,
      cross_id: { $oid: groupId },
    },
  },
}) {
  const [showEdit, toggleShowEdit] = useToggle(false);
  const [showDelete, toggleShowDelete] = useToggle(false);
  const { deleteGroup } = useGroups();
  useEffect(() => {
    toggleShowDelete(false);
  }, [toggleShowDelete, groupId]);

  const actions = [
    {
      ...RiveryDropdown.EditMenuItem,
      value: 'Edit Group',
      onClick: toggleShowEdit,
    },
    {
      ...RiveryDropdown.DeleteMenuItem,
      value: 'Delete Group',
      onClick: toggleShowDelete,
    },
  ];
  return (
    <>
      <RiveryDropdown
        menuButtonAriaLabel={`group ${name} actions`}
        isLazy
        menuItems={actions}
        id={`group ${name} actions`}
      />
      {showEdit ? (
        <Groups modalOnly groupId={groupId} onClose={toggleShowEdit} />
      ) : null}
      <ConfirmationModal
        title="This will permanently delete this group"
        description="All of the data flows from that group will be added to the default group. Are you sure you would like to delete it?"
        onConfirm={() => deleteGroup(groupId)}
        onClose={toggleShowDelete}
        variant="error"
        show={showDelete}
      />
    </>
  );
}

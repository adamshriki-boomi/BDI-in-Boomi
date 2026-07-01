import { IGroup } from 'api/types';
import { useGroupsState } from 'store/groups';
import { useGroupsActions } from 'store/groups/hooks/useGroupsLoaderActions';
import { useRiverActions } from 'store/river';
import { getOId } from 'utils/api.sanitizer';

/**
 * State layer for interacting with groups
 */
export function useGroups() {
  const { setGroup } = useRiverActions();
  const { groups, loading } = useGroupsState();
  const { updateGroup, createOne, deleteOne, fetchGroups } = useGroupsActions();

  const create = async (data: IGroup) => {
    const response: any = await createOne(data);
    const group = response.payload;
    await fetchGroups();
    return group;
  };

  const createAndSet = async (data: IGroup) => {
    const group = await create(data);
    setGroup(getOId(group.cross_id));
    await fetchGroups();
    return group;
  };

  const update = async (data: IGroup) => {
    const group = await updateGroup(data);
    await fetchGroups();
    return group;
  };

  return {
    groups,
    update,
    createAndSet,
    create,
    deleteGroup: deleteOne,
    setGroup,
    loading,
  };
}

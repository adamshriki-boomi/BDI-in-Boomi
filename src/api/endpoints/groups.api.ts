import { IDeleteGroupResponse, IGroup } from 'api/types';
import { getCrossId } from 'utils/api.sanitizer';
import { extractData, getData, patch, put, remove } from '../api.proxy';
const RIVER_GROUPS_URL = `/river_groups`;

// GET REQUESTS
export const fetch = (): Promise<IGroup[]> => {
  return getData(RIVER_GROUPS_URL).then(data =>
    data.groups?.map(({ update_time, ...rest }) => {
      return { update_time: update_time?.$date ?? update_time, ...rest };
      // fixing and aligning the groups date
      // until it will be developed in the new api
    }),
  );
};

export const update = (data: IGroup): Promise<IGroup> => {
  return patch(RIVER_GROUPS_URL, data, {
    params: { _id: getCrossId(data) },
  });
};

export const create = (
  data: Pick<IGroup, 'color' | 'icon' | 'is_default' | 'name'>,
): Promise<IGroup> => {
  return put(RIVER_GROUPS_URL, data).then(extractData);
};

export const deleteOne = (_id: string): Promise<IDeleteGroupResponse> => {
  return remove(RIVER_GROUPS_URL, {
    params: { _id },
  }).then(extractData);
};

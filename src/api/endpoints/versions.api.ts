import { IRiver } from 'api/types';
import { createOId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';
import { postBody, putDataV1 } from '../api.proxy';
import { getRiversData } from './rivers.api';

const getVersionsData = (path: string, params: Record<string, any>) =>
  getRiversData(`/versions/${path}`, params);

type BookmarkResponse = {
  message: string;
};
type BookmarkParams = {
  river_id: string;
  version_id: string;
};
const updateBookmark =
  <T>(apiPath: string) =>
  async (params: BookmarkParams & T): Promise<BookmarkResponse> => {
    return postBody(`rivers/versions/${apiPath}`, params).then(
      pluck('message'),
    );
  };
export const setBookmarkVersion = updateBookmark('bookmark_version');
export const removeBookmarkVersion = updateBookmark('unbookmark_version');
export const updateBookmarkName = updateBookmark<{ version_name: string }>(
  'name',
);

export const getVersionDetails = (
  river_id: string,
  version_id: string,
): Promise<Omit<IRiver, '_id' | 'cross_id'>> => {
  return getVersionsData('details', { river_id, version_id });
};

type RestoreVersionParams = {
  river_id: string;
  version_id: string;
  is_api_v2?: boolean;
};
export const restoreVersion = (
  params: RestoreVersionParams,
): Promise<Omit<IRiver, 'cross_id'>> => {
  if (params?.is_api_v2) {
    return putDataV1(true, `/rivers/${params?.river_id}/restore`, {
      version_id: params?.version_id,
    });
  } else {
    return postBody('rivers/restore', params)
      .then(pluck('data'))
      .then(river => ({ ...river, cross_id: createOId(params.river_id) }));
  }
};

import { API } from 'api';
import { useRiverId } from 'containers/Activities/helpers';
import { useToggle } from 'react-use';
import { useRiver } from 'store/river';
import { getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { useGetRiverVersionsQuery } from './versions.query';
import { IRiverVersion } from './versions.types';

const sortByDates = (versions: IRiverVersion[] = []) => {
  return [...versions]?.sort((a, b) =>
    b.insert_date.localeCompare(a.insert_date),
  );
};
// UTILS
export const useVersions = (triggerFetch = false, skip = false) => {
  const { isVersionMode } = useRiver();
  const riverId = useRiverId();
  const {
    data,
    isLoading,
    isFetching,
    refetch: fetchVersions,
  } = useGetRiverVersionsQuery(riverId, {
    skip: !riverId || skip,
    refetchOnMountOrArgChange: triggerFetch,
  });
  const stats = data?.statistics;
  const versionItems = data?.items;
  const loading = isLoading || isFetching;

  const [bookmarkOnly, toggleBookmarkFilter] = useToggle(false);
  const isBookmarkLimited = () =>
    stats.bookmarks_allowed === filterBookmarkedVersions().length;
  const { removeBookmark, addBookmark, updateBookmarkName } = useBookmarksApi(
    riverId,
    isBookmarkLimited,
    fetchVersions,
  );

  const filterBookmarkedVersions = () =>
    versionItems?.filter(compare('bookmarked', true, Boolean));
  const versions = sortByDates(
    bookmarkOnly ? filterBookmarkedVersions() : versionItems,
  );

  const total = versionItems?.length;

  const isFirst = (index: number) => index === 0;

  const isActiveVersion = (
    version: IRiverVersion,
    versionId: string,
    index: number,
  ) => {
    return !isVersionMode
      ? isFirst(index)
      : versionId === getOId(version.version_id);
  };

  return {
    loading,
    stats,
    versions,
    total,
    toggleBookmarkFilter,
    bookmarkOnly,
    addBookmark,
    removeBookmark,
    updateBookmarkName,
    isActiveVersion,
    isFirst,
  };
};

/**
 * expose versions bookmarks api
 */
const useBookmarksApi = (
  river_id: string,
  isBookmarkLimited,
  fetchVersions,
) => {
  const toggleBookmark = async (versionId: string, toggle = true) => {
    await (toggle
      ? API.versions.setBookmarkVersion
      : API.versions.removeBookmarkVersion)({
      river_id,
      version_id: versionId,
    });
    await fetchVersions(river_id);
  };

  const addBookmark = async (versionId: string) => {
    if (isBookmarkLimited()) {
      return false;
    }
    return toggleBookmark(versionId);
  };

  const updateBookmarkName = async (
    version_name: string,
    version_id: string,
  ) => {
    await API.versions.updateBookmarkName({
      version_name,
      version_id,
      river_id,
    });
    await addBookmark(version_id);
    await fetchVersions(river_id);
  };

  const removeBookmark = async (versionId: string) =>
    toggleBookmark(versionId, false);

  return {
    toggleBookmark,
    addBookmark,
    updateBookmarkName,
    removeBookmark,
  };
};

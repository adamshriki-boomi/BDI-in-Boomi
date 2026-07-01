import { API } from 'api';
import { throwResponseError } from 'api/endpoints/auth.api';
import { IConnection } from 'api/types';
import { populateDefaults } from 'containers/River/river.utils';
import { useToastComponent } from 'hooks/useToast';
import {
  useGetConnectionQuery,
  useLazyGetConnectionRelatedRiversQuery,
} from 'modules/ConnectionModal/store';
import { useGetDataSourceQuery } from 'modules/Datasources';
import { useConnectionTypesActions } from 'store/connectionTypes';
import { getOId } from 'utils/api.sanitizer';

type UseSourceConfig = {
  crossId: string;
  connectionType: string;
  dataSourceId: string;
  isEditMode: boolean;
  /**
   * skip fetching data source until `true`
   */
  skip: boolean;
};
/**
 * a service for fetching and managing a data source
 */
export const useSource = ({
  crossId,
  connectionType,
  dataSourceId,
  isEditMode,
  skip,
}: UseSourceConfig) => {
  const { error } = useToastComponent();
  const [getRelatedRivers] = useLazyGetConnectionRelatedRiversQuery();
  const {
    data: source,
    isLoading,
    isFetching,
  } = useGetDataSourceQuery(
    { connectionType, dataSourceId },
    {
      skip: skip || ![connectionType, dataSourceId].every(Boolean),
    },
  );

  const sourceControls = source?.ui_rows || [];
  const sourceControlsDefaults = source?.defaults || {};
  const connectionDraft = useConnectionDraftCreator({
    source,
    isEditMode,
    crossId,
    sourceControlsDefaults,
    skip,
  });
  const { fetchConnectionsByType } = useConnectionTypesActions();
  // FIXME: the || will be gone once all connections include ui_rows
  const checkRelatedRivers = async (isEditMode, data) => {
    if (isEditMode) {
      const res = await getRelatedRivers({
        connection: getOId(data?.cross_id),
      });
      const rivers = (res as any)?.data;
      if (rivers?.length > 0) {
        const riversNames = rivers.map(river => river.river_name).join('","');
        error({
          duration: 10000,
          description: `We cannot update this connection while there are data flows that their streaming is enabled. please first disable the streaming from the next data flows: "${riversNames}"`,
        });
        throwResponseError('Something went wrong. Nothing was done.');
      }
    }
  };
  const saveConnection = async data => {
    const handler = isEditMode
      ? API.connections.updateConnection
      : API.connections.createConnection;
    await checkRelatedRivers(isEditMode, data);
    const response = await handler(data);
    if (API.common.isStatusSuccess(response)) {
      await fetchConnectionsByType(connectionType);
      return response;
    } else {
      error({
        duration: 10000,
        description:
          response?.message ?? 'Something went wrong. Nothing was done.',
      });
      throwResponseError('Something went wrong. Nothing was done.');
    }
  };

  return {
    sourceControls,
    connectionDraft,
    source,
    saveConnection,
    isLoading: isLoading || isFetching,
  };
};

/**
 * creates a connection "draft": new or a copy from an existing crossId
 */
const useConnectionDraftCreator = ({
  source,
  isEditMode,
  crossId,
  sourceControlsDefaults: defaults,
  skip,
}): Partial<IConnection> => {
  const { data, isLoading, isFetching } = useGetConnectionQuery(crossId, {
    refetchOnMountOrArgChange: 1,
    skip: skip || [!isEditMode, !crossId].some(Boolean),
  });

  const loading = isLoading || isFetching;
  const draft = !isEditMode ? createNewDraft(source) : data;

  return source && !loading ? populateDefaults({ draft, defaults }) : {};
};

/**
 * these props should be in a new draft
 */
const draftPropsToKeep = [
  'connection_type',
  'is_fz_connection',
  'default_bucket',
  'is_test_connection',
  'doc_url',
  'custom_fz',
];
const createNewDraft = source => {
  return draftPropsToKeep.reduce((json, prop) => {
    if (typeof source?.[prop] !== 'undefined') {
      json[prop] = source?.[prop];
    }
    return json;
  }, {});
};

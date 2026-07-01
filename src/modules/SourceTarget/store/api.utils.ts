import { convertArrayToObject } from 'utils/array.utils';
import {
  IRiverKind,
  IRiverResponseV1,
  IRiverTypes,
  IRiverV1,
  SchemasApiResponse,
} from './types';

export const replaceSchemas = (river, schemas) => {
  let filtered;
  if (Array.isArray(schemas)) {
    filtered = [...schemas.filter(({ tables }) => Boolean(tables?.length))];
  } else {
    filtered = schemas;
  }
  return {
    ...river,
    properties: {
      ...river.properties,
      schemas: filtered,
    },
  };
};

export const convertSchemasArrayToObject = (schemas: SchemasApiResponse) => {
  return schemas.reduce((result, { name, tables }) => {
    return {
      ...result,
      //this will not work with predefined reports, we will need to fix previous implementation
      [name]: convertArrayToObject(tables, 'name'),
    };
  }, {});
};
export const convertRiverToPayload = (river: IRiverV1): IRiverResponseV1 => {
  const schemasList = Object.entries(river.properties.schemas);
  const schemas = schemasList.map(([schemaName, tables]) => {
    return {
      name: schemaName,
      tables: Object.values(tables)
        .filter(table => table && table.is_selected)
        .map(table => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { schemaName = '', ...tableData } = table;
          return {
            details: tableData,
          };
        }),
    };
  });
  return replaceSchemas(river, schemas);
};

const getCurrentTimeCronExpression = () => {
  const current = new Date();
  const hours = current.getUTCHours();
  const minutes = current.getMinutes();
  return `${minutes} ${hours} 1/1 * *`;
};

export const createRiverTemplate = (): Omit<
  IRiverV1,
  | 'cross_id'
  | 'account_id'
  | 'notification_settings'
  | 'environment_cross_id'
  | 'environment_name'
> => ({
  kind: IRiverKind.MAIN_RIVER,
  type: IRiverTypes.SOURCE_TO_TARGET,
  name: '',
  group_id: '',
  group_name: '',
  ...devPropsProperties,
  schedulers: [
    { is_enabled: true, cron_expression: getCurrentTimeCronExpression() },
  ],
  settings: {
    run_timeout_seconds: null,
    notification: {
      failure: {
        email: '{Mail_Alert_Group}',
        is_enabled: false,
        execution_time_limit_seconds: 0,
      },
      warning: {
        email: '{Mail_Alert_Group}',
        is_enabled: false,
        execution_time_limit_seconds: 0,
      },
      run_threshold: {
        email: '{Mail_Alert_Group}',
        is_enabled: false,
        execution_time_limit_seconds: 0,
      },
    },
  },
  metadata: {},
});

const devPropsProperties = import.meta.env.VITE_STT_SUPER
  ? {
      properties: {
        source: {} as any,
        target: {
          table_prefix: '',
          loading_method: 'merge',
          merge_method: undefined,
          name: '',
          schema_name: undefined,
        } as any,
        schemas: {},
      },
    }
  : {
      properties: {
        source: {},
        target: { loading_method: 'merge', merge_method: 'merge' },
        schemas: {},
      },
    };

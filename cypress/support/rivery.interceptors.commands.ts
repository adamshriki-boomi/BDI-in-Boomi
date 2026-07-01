export * as rtl from '@testing-library/cypress/add-commands';
declare global {
  namespace Cypress {
    interface Chainable {
    interceptConnection: typeof interceptConnection;
    waitConnection: typeof waitConnection;
    interceptConnectionId: typeof interceptConnectionId;
    interceptRelatedConnections: typeof interceptRelatedConnections;
    waitConnectionId: typeof waitConnectionId;
    getConnectionId: typeof getConnectionId;
    waitEnvironments: typeof waitEnvironments;
    waitPlans: typeof waitPlans;
    interceptDataSources: typeof interceptDataSources;
    interceptAllDataSources: typeof interceptAllDataSources;
    interceptTargets: typeof interceptTargets;
    interceptDataSourcesTypes: typeof interceptDataSourcesTypes;
    waitDataSources: typeof waitDataSources;
    interceptEmptyResponse: typeof customCommands.interceptEmptyResponse;
    interceptRiver: typeof customCommands.interceptRiver;
    waitRiver: typeof customCommands.waitRiver;
    interceptDataframesGet: typeof customCommands.interceptDataframesGet;
    interceptDataframesGetWith: typeof customCommands.interceptDataframesGetWith;
    waitDataframesGet: typeof customCommands.waitDataframesGet;
    interceptRiversGet: typeof customCommands.interceptRiversGet;
    interceptRiversGetList: typeof customCommands.interceptRiversGetList;
    waitRiversGet: typeof customCommands.waitRiversGet;
    interceptRiverGet: typeof customCommands.interceptRiverGet;
    waitRiverGet: typeof customCommands.waitRiverGet;
    interceptRiversGetV1: typeof customCommands.interceptRiversGetV1;
    interceptRiversPostV1: typeof customCommands.interceptRiversPostV1;
    interceptRiversPutV1: typeof customCommands.interceptRiversPutV1;
    interceptBlueprintsList: typeof interceptBlueprintsList;
    interceptBlueprintById: typeof interceptBlueprintById;
    interceptBlueprintFile: typeof interceptBlueprintFile;
    interceptBlueprintFileContent: typeof interceptBlueprintFileContent;
    interceptBlueprintInterfaceParametersBatch: typeof interceptBlueprintInterfaceParametersBatch;
    interceptBlueprintReports: typeof interceptBlueprintReports;
    interceptValidateBlueprintYaml: typeof interceptValidateBlueprintYaml;
    interceptEditBlueprintFile: typeof interceptEditBlueprintFile;
    interceptAddBlueprintFile: typeof interceptAddBlueprintFile;
    interceptCreateBlueprint: typeof interceptCreateBlueprint;
    mockBlueprintFlow: typeof mockBlueprintFlow;
    }
  }
}
type ConnectionTypeList =
  | ''
  | 'gcloud'
  | 'aws'
  | 'azure'
  | 'azure_sql_dwh'
  | 'snowflake'
  | 'custom'
  | 'redshift'
  | 'mysql'
  | 'blueprint_custom';
const interceptConnection = (type: ConnectionTypeList, fixture: string) => {
  return cy.interceptApi(
    `connections?*connection_type=${type}`,
    `connections/${fixture}`,
  );
};
Cypress.Commands.add('interceptConnection', interceptConnection);

const waitConnection = (type: ConnectionTypeList) => {
  return cy.waitApi(`connections?*connection_type=${type}`);
};
Cypress.Commands.add('waitConnection', waitConnection);

type IConnectionFixture = 'azure' | 'snowflake' | 'azure_sql';
const interceptConnectionId = (fixture: IConnectionFixture) => {
  return cy.interceptApi(
    `connections?*_id=*`,
    `connections/connections._id=${fixture}.get.json`,
  );
};
Cypress.Commands.add('interceptConnectionId', interceptConnectionId);

const interceptRelatedConnections = (fixture: string) => {
  return cy.interceptApi(`connections/rivers?_id=*`, fixture);
};
Cypress.Commands.add(
  'interceptRelatedConnections',
  interceptRelatedConnections,
);

const waitConnectionId = createWait('connections?*_id=*');
Cypress.Commands.add('waitConnectionId', waitConnectionId);

const getConnectionId = () => {
  return cy.get(`@connections?*_id=*`);
};
Cypress.Commands.add('getConnectionId', getConnectionId);

const waitEnvironments = createWait('getEnvironments');
Cypress.Commands.add('waitEnvironments', waitEnvironments);

const waitPlans = createWait('plans');
Cypress.Commands.add('waitPlans', waitPlans);

const dataSourceUrl = 'datasource_types/all*connection_type=*';
const interceptDataSources = (fixture: string, type = '*') => {
  return cy.interceptGetApi(dataSourceUrl.replace('=*', `=${type}`), fixture);
};
Cypress.Commands.add('interceptDataSources', interceptDataSources);
const interceptAllDataSources = (fixture: string) => {
  cy.interceptGetApi1(
    'data_source_types*',
    'datasources_types/all_v1.get.json',
  );
  cy.interceptGetApi1(
    'data_source_sections?*segment=source*',
    'datasources_types/sections_v1_source.json',
  );
  cy.interceptGetApi('datasource_types/all*', `datasources_types/${fixture}`);
};
Cypress.Commands.add('interceptAllDataSources', interceptAllDataSources);

const interceptTargets = () => {
  cy.interceptGetApi1(
    'data_source_sections?*segment=target*',
    'datasources_types/sections_v1_target.json',
  );
  cy.interceptGetApi1(
    'datasource_types?segment=target',
    `datasources_types/datasource_types_target.json`,
  );
  cy.interceptGetApi1('target_types?*', 'datasources_types/target_types.json', 200, 'targetTypes');
};
Cypress.Commands.add('interceptTargets', interceptTargets);

type DataSourcesTypes =
  | 'snowflake.get'
  | 'azuresql.get'
  | 'aws.get'
  | 'all.get.json'
  | 'googlebq.get'
  | string;
const interceptDataSourcesTypes = (fixture: DataSourcesTypes) => {
  return cy.interceptGetApi(dataSourceUrl, `datasources_types/${fixture}`);
};
Cypress.Commands.add('interceptDataSourcesTypes', interceptDataSourcesTypes);

const waitDataSources = createWait(dataSourceUrl);
Cypress.Commands.add('waitDataSources', waitDataSources);

const customCommands = {
  interceptEmptyResponse: (url: string) => {
    return cy.interceptGetApi(url, 'empty.response');
  },
  interceptRiver: (fixture: string) => {
    return cy.interceptPostApi('rivers/list', `rivers-list/${fixture}`);
  },
  waitRiver: createWait('rivers/list'),
  interceptDataframesGetWith: (fullPathFixture: string, urlSuffix = '') => {
    cy.interceptGetApi1(`dataframes?${urlSuffix}*`, fullPathFixture);
  },
  interceptDataframesGet: (fixture: string, urlSuffix = '') => {
    return customCommands.interceptDataframesGetWith(
      `dataframes/${fixture}`,
      urlSuffix,
    );
  },
  waitDataframesGet: createWait('dataframes?*'),
  interceptRiversGetList: createInterceptorGet(`rivers/list`, `rivers-list/`),
  interceptRiversGet: createInterceptorGet(`rivers?*`, `rivers-list/`),
  waitRiversGet: createWait('rivers?*'),
  interceptRiverGet: createInterceptorGet('rivers/list?*', 'rivers-list'),
  waitRiverGet: createWait('rivers/list?*'),
  interceptRiversGetV1: createInterceptorGetV1(`rivers/*`, `rivers-list/`),
  interceptRiversPostV1: createInterceptorPostV1(`rivers*`, `rivers-list/`),
  interceptRiversPutV1: createInterceptorPutV1(`rivers/*`, `rivers-list/`),
  // interceptRiversPostV1: interceptPostApi1(`rivers*`, `rivers-list/`),
};

Object.entries(customCommands).forEach(([command, method]) => {
  Cypress.Commands.add(command as any, method);
});

// UTILS
function createWait(alias: string) {
  return () => {
    return cy.waitApi(alias);
  };
}

function createInterceptorGet(url, dir) {
  return (fixture = '') => {
    return cy.interceptGetApi(url, `${dir}${dir ? '/' : ''}${fixture}`);
  };
}

function createInterceptorGetV1(url, dir) {
  return (fixture = '') => {
    return cy.interceptGetApi1(url, `${dir}${dir ? '/' : ''}${fixture}`);
  };
}

function createInterceptorPostV1(url, dir) {
  return (fixture = '') => {
    return cy.interceptPostApi1(url, `${dir}${dir ? '/' : ''}${fixture}`);
  };
}

function createInterceptorPutV1(url, dir) {
  return (fixture = '') => {
    return cy.interceptPutApi1(url, `${dir}${dir ? '/' : ''}${fixture}`);
  };
}

// ---------------------------------------------------------------------------
// Blueprint interceptors
// ---------------------------------------------------------------------------

type BlueprintFlavor = 'legacy' | 'multi';

const interceptBlueprintsList = (fixture = 'list.json') => {
  return cy.interceptGetApi1('*recipes?*', `blueprints/${fixture}`);
};
Cypress.Commands.add('interceptBlueprintsList', interceptBlueprintsList);

const interceptBlueprintById = (flavor: BlueprintFlavor) => {
  const id = flavor === 'legacy' ? 'bp_legacy_1' : 'bp_multi_1';
  return cy.interceptGetApi1(
    `*recipes/${id}`,
    `blueprints/blueprint.${flavor}.json`,
  );
};
Cypress.Commands.add('interceptBlueprintById', interceptBlueprintById);

const interceptBlueprintFile = (flavor: BlueprintFlavor) => {
  const fileId = flavor === 'legacy' ? 'file_legacy_1' : 'file_multi_1';
  return cy.interceptGetApi1(
    `*recipes/files/${fileId}`,
    `blueprints/file.${flavor}.json`,
  );
};
Cypress.Commands.add('interceptBlueprintFile', interceptBlueprintFile);

const interceptBlueprintFileContent = (flavor: BlueprintFlavor) => {
  // The app fetches the presigned_url returned by getBlueprintFile. The
  // fixtures point that at stub.invalid; intercept and return empty YAML so
  // the edit drawer can render without an error.
  return cy.intercept(
    `https://stub.invalid/blueprints/${
      flavor === 'legacy' ? 'file_legacy_1' : 'file_multi_1'
    }.yaml`,
    { statusCode: 200, body: 'connector:\n  name: stub\n' },
  );
};
Cypress.Commands.add(
  'interceptBlueprintFileContent',
  interceptBlueprintFileContent,
);

const interceptBlueprintInterfaceParametersBatch = (flavor: BlueprintFlavor) => {
  const fileId = flavor === 'legacy' ? 'file_legacy_1' : 'file_multi_1';
  return cy.interceptGetApi1(
    `*recipes/files/${fileId}/reports/interface_parameters`,
    `blueprints/interface_parameters.${flavor}.json`,
  );
};
Cypress.Commands.add(
  'interceptBlueprintInterfaceParametersBatch',
  interceptBlueprintInterfaceParametersBatch,
);

const interceptBlueprintReports = (flavor: BlueprintFlavor) => {
  const id = flavor === 'legacy' ? 'bp_legacy_1' : 'bp_multi_1';
  return cy.interceptGetApi1(
    `*recipes/${id}/reports*`,
    `blueprints/reports.${flavor}.json`,
  );
};
Cypress.Commands.add('interceptBlueprintReports', interceptBlueprintReports);

const interceptValidateBlueprintYaml = (
  variant: 'success' | 'error' = 'success',
) => {
  if (variant === 'error') {
    return cy.intercept(
      'POST',
      `${Cypress.env('v1_path')}/*recipes/files/validate`,
      {
        statusCode: 400,
        body: {
          detail:
            "A 'date_range' interface parameter is not allowed in the global interface parameters of a multi-report Blueprint.",
        },
      },
    ).as('validateYaml');
  }
  return cy.interceptPostApi1(
    '*recipes/files/validate',
    'blueprints/validate.success.json',
  );
};
Cypress.Commands.add(
  'interceptValidateBlueprintYaml',
  interceptValidateBlueprintYaml,
);

const interceptEditBlueprintFile = (
  variant: 'success' | 'error' = 'success',
  flavor: BlueprintFlavor = 'legacy',
) => {
  const fileId = flavor === 'legacy' ? 'file_legacy_1' : 'file_multi_1';
  if (variant === 'error') {
    return cy.intercept(
      'PUT',
      `${Cypress.env('v1_path')}/*recipes/files/${fileId}`,
      {
        statusCode: 422,
        body: { detail: 'Failed to update blueprint file' },
      },
    ).as('editBlueprintFile');
  }
  return cy.interceptPutApi1(
    `*recipes/files/${fileId}`,
    `blueprints/file.${flavor}.json`,
  );
};
Cypress.Commands.add('interceptEditBlueprintFile', interceptEditBlueprintFile);

const interceptAddBlueprintFile = (flavor: BlueprintFlavor = 'legacy') => {
  return cy.interceptPostApi1(
    '*recipes/files*',
    `blueprints/file.${flavor}.json`,
  );
};
Cypress.Commands.add('interceptAddBlueprintFile', interceptAddBlueprintFile);

const interceptCreateBlueprint = (flavor: BlueprintFlavor = 'legacy') => {
  return cy.interceptPostApi1(
    '*recipes?*',
    `blueprints/blueprint.${flavor}.json`,
  );
};
Cypress.Commands.add('interceptCreateBlueprint', interceptCreateBlueprint);

/**
 * One-stop helper: intercepts list + single + file + interface params for the
 * given blueprint flavor. Use this in test Background when the test just
 * needs the blueprint to load — call individual interceptors directly when a
 * test needs to override a specific response.
 */
const mockBlueprintFlow = (flavor: BlueprintFlavor) => {
  cy.interceptBlueprintsList();
  cy.interceptBlueprintById(flavor);
  cy.interceptBlueprintFile(flavor);
  cy.interceptBlueprintInterfaceParametersBatch(flavor);
  cy.interceptBlueprintReports(flavor);
};
Cypress.Commands.add('mockBlueprintFlow', mockBlueprintFlow);
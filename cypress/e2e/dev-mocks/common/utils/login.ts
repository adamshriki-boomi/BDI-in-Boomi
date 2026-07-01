export const RiverMocks = {
  SimpleRiver: {
    url: 'rivers/list',
    fixture: 'rivers-list/simple-river.json',
  },
  NonVersionMode: {
    url: 'rivers/list',
    fixture: 'empty.response.json',
    status: 500,
    
  },
  SimpleValidRiver: {
    url: 'rivers/list',
    fixture: 'rivers-list/simple-river.valid.json',
  },
  PythonRiver: {
    url: 'rivers/list',
    fixture: 'rivers-list/python-river.json',
  },
  RiverWithError: {
    url: 'rivers/list',
    fixture: 'rivers-list/river-with-error.json',
  },
  RiverWithErrorFallBack: {
    url: 'rivers/list',
    fixture: 'rivers-list/river-with-error-fallback.json',
  }
};
export const loginMocks = {
  riverGroups: { url: 'river_groups*', fixture: 'river_groups/get.json' },
  riverTypesList: {
    url: 'river_types/list*',
    fixture: 'river_types-list.get.json',
  },
};
export const riverUrls = {
  [loginMocks.riverGroups.url]: loginMocks.riverGroups.fixture,
};

const connectionsUrls = {
  'connections?*connection_type=gcloud*': 'connections/connections.empty.json',
  'connections?*connection_type=aws*': 'connections/connections.empty.json',
  'connections?*connection_type=azure*': 'connections/connections.empty.json',
  'connections?*connection_type=snowflake*':
    'connections/connections.empty.json',
  'connections?*connection_type=custom*': 'connections/connections.empty.json',
  'connections?*connection_type=redshift*':
    'connections/connections.empty.json',
  'connections?*connection_type=athena*': 'connections/connections.empty.json',
};

const resourcesUrls = {
  'logicode_resources?*': 'resources/list.json',
};

const usersUrls = {
  '/users*': 'audit/users.json',
};

const auditLogUrls = {
  'audit_events?*': 'audit/audit_full_response.json',
};

const templatesUrls = {
  logicode_template: 'templates/url.json',
  test_python_template: 'templates/list.json',
};
const metadataUrls = {
  'pull/datasets*': 'metadata/metadata.post.json',
  'pull/databases*': 'metadata/metadata.post.json',
  'pull/schemas*': 'metadata/metadata.post.json',
  'pull/buckets*': 'metadata/metadata.post.json',
  'pull*': 'metadata/metadata.D.json',
};

const requirementsUrls = {
  'logicode_file/requirements': 'logicode_file/requirements.link.json',
  fake_s3_download_url: 'logicode_file/requirements.txt',
};

export const signInWithSimpleRiver = (fixtures?: Record<string, any>, disabledInterceptors = []) =>
  signToAppWithRiver(RiverMocks.SimpleRiver, fixtures, disabledInterceptors);

export const signToAppWithRiver = (
  riverMock: {
    url: string;
    fixture: string;
    status?: number;
  },
  fixtures?: Record<string, any>,
  disabledInterceptors: string[] = []
) => {
  cy.mockAccounts();
  cy.intercept('GET', '*logicode-data-us-east**', {
    statusCode: 200,
    fixture: 'empty.response'
  }).as('logicode')
  cy.interceptGetApi1('onboarding', 'onboarding/get.onboarding.json');
  cy.interceptGetApi1('has_rivers', 'dashboard/has_rivers.json');
  cy.interceptGetApi1('notification', 'login/notifications.json');
  cy.intercept('GET', '*chargebeestatic*', {
    statusCode: 200,
    fixture: 'empty.response'
  }).as('chargebee')
  cy.interceptEmptyResponse('changelogs?*');
  cy.interceptRiversGetList('rivers-list.get.json');
  cy.interceptPostApi(riverMock.url, riverMock.fixture, riverMock?.status ?? 200);
  cy.interceptRiverGet('rivers-list.get.json');
  cy.interceptRiversGet('paginated-rivers-list.get.json');
  cy.interceptMany(riverUrls);
  cy.interceptMany(connectionsUrls);
  cy.interceptApi('actions/list', 'actions/list.post.json');
  cy.interceptMany(resourcesUrls);
  cy.interceptGetApi1('users*', 'users/get_users.json');
  cy.interceptMany(auditLogUrls);
  cy.interceptMany(templatesUrls);
  cy.interceptMany(metadataUrls);
  cy.interceptMany(requirementsUrls);
  cy.interceptGetApi1('onboarding', 'onboarding/get.onboarding.json');
  cy.interceptPostApi1('onboarding', `onboarding/post.onboarding.step1.onboarding_rivery_introduction.json`)
  cy.interceptGetApiAs('plans', 'billing/plans.json', 'plans', 200, 1);
  disabledInterceptors?.includes('dataframes') ? undefined : cy.interceptDataframesGet('list.json');
  cy.interceptGetApiAs(
    '/variables*',
    'river-variables/variables.json',
    'rivers/variables',
    200,
    1,
  );
  cy.interceptAllDataSources('all.get');
  cy.interceptTargets();
  cy.interceptDataSources('datasources_types/googlebq.get', 'gcloud');
  cy.interceptApi1BodyAs('logicode_file/template*', {
    url: `${Cypress.env('v1_path')}/python_editor_templates`
  });
  cy.interceptGetApi1('python_editor_templates', 'python/template.txt');
  cy.interceptPutApi1('/variables', 'rivers-list/simple-river.json');
  cy.interceptMany({
    [loginMocks.riverTypesList.url]: loginMocks.riverTypesList.fixture,
  });
  cy.interceptLogin('signout.json', 401);
  cy.interceptGetApi('revoke_token', 'login/revoke.json');
  cy.mockFakeLoginSingleAccount({
    login: fixtures?.login,
    token: fixtures?.token,
    usage: fixtures?.usage,
  });
  cy.signInFake();
  cy.visit('/accounts')
  cy.selectAdminAccount();
  // cy.wait('@postLogin');
  cy.wait(['@token*', '@getEnvironments']);
};

export const interceptRiverUrls = () => {
  cy.interceptRiverGet('rivers-list.get.json');
  cy.interceptRiversGet('paginated-rivers-list.get.json');
  cy.interceptMany({
    ...riverUrls,
    [loginMocks.riverTypesList.url]: loginMocks.riverTypesList.fixture,
  });
};

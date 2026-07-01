import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { signInWithSimpleRiver } from '../../common/utils/login';

const ACTIVITIES = 'activities?*';
const ACTIVITIES_STATS = 'activities_statistics?*';
const ACTIVITIES_GRAPH = 'activities_graph';
const ACTIVITIES_SCHEDULERS = 'activities_run_groups?*';
const RUNS = 'runs?*';
const FAILED_RUN_SINGLE = 'runs/374a2f7981ae4d7380b2cc911fa2131d';
const TASKS = 'tasks';
const FETCH_RIVER = 'rivers/list';

Given('I am signed in as admin with AI disabled', function () {
  signInWithSimpleRiver({
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.admin.json',
  });
});

Given('I set up troubleshoot activities', () => {
  cy.interceptGetApi1(ACTIVITIES, 'activities/get.troubleshoot.activities.json');
  cy.interceptGetApi1(ACTIVITIES_STATS, 'activities/get.troubleshoot.activities_statistics.json');
  cy.interceptPostApi1(ACTIVITIES_GRAPH, 'activities/post.activities_graph.json');
});

Given('I set up the failed S2T run', () => {
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_s2t_river.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.s2t.activities_schedulers.json');
  cy.interceptGetApi1(RUNS, 'activities/get.s2t_failed_runs.json');
  cy.interceptGetApi1(FAILED_RUN_SINGLE, 'activities/get.s2t_failed_run_data.json');
  cy.interceptGetApi1(TASKS, 'activities/get.s2t_failed_tasks.json');
});

Given('I am signed in as admin with AI enabled', function () {
  signInWithSimpleRiver({
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.admin.ai_enabled.json',
  });
});

Given('I am signed in as non-admin with AI disabled', function () {
  signInWithSimpleRiver({
    token: 'token/token.success.api.viewer.ai_disabled.json',
  });
});

Given('I navigate to failed S2T run', () => {
  cy.interceptGetApi1(ACTIVITIES, 'activities/get.troubleshoot.activities.json');
  cy.interceptGetApi1(ACTIVITIES_STATS, 'activities/get.troubleshoot.activities_statistics.json');
  cy.interceptPostApi1(ACTIVITIES_GRAPH, 'activities/post.activities_graph.json');
  cy.sidebar('Activities');
  cy.wait(`@${ACTIVITIES}`);
  cy.wait(`@${ACTIVITIES_STATS}`);
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_s2t_river.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.s2t.activities_schedulers.json');
  cy.interceptGetApi1(RUNS, 'activities/get.s2t_failed_runs.json');
  cy.interceptGetApi1(FAILED_RUN_SINGLE, 'activities/get.s2t_failed_run_data.json');
  cy.interceptGetApi1(TASKS, 'activities/get.s2t_failed_tasks.json');
  cy.findByLabelText('Jira | Test').click({ force: true });
  cy.findByLabelText('run-1').click({ force: true });
});

When('troubleshoot activities have loaded', () => {
  cy.wait(`@${ACTIVITIES}`);
  cy.wait(`@${ACTIVITIES_STATS}`);
});

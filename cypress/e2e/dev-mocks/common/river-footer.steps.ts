import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

export const modifyRiver = 'rivers/modify*';
const runRiver = '/run';
const checkRun = '/runs/**';
const cancelRun = '/cancel_run';
const cancelRunOld = 'run/cancel*';

const wait = url => {
  cy.wait(`@${url}`, { timeout: 10000 });
};
Given('I want to save a river when my session expired', () => {
  cy.interceptApi(modifyRiver, 'rivers-list/error-session-expired.json', 401);
});
Given('I want to save a river', () => {
  cy.interceptMany({
    [modifyRiver]: 'rivers-list/simple-river.json',
  });
});
Given('I want to save a river with error', () => {
  cy.interceptApi(modifyRiver, 'rivers-list/simple-river-error.json', 400);
});

Given('I want to run a river', () => {
  cy.interceptPostApi1(runRiver, 'run/run.river.json', 200, runRiver);
  cy.interceptGetApi1(checkRun, 'run/check.run.json', 200, checkRun);
});

Given('I want to see logs for the river run', () => {
  cy.interceptPostApi('activities/last_runs/target**', 'rivers-list/river.last-runs.json' )
  cy.interceptGetApi('activities/runs**','rivers-list/river.logic-logs.json' )
})

Given('I want to run a valid river', () => {
  cy.interceptPostApi1(runRiver, 'run/run.river.json', 200, runRiver);
  cy.interceptGetApi1(checkRun, 'run/check.run.json', 200, checkRun);
  cy.interceptMany({
    [modifyRiver]: 'rivers-list/simple-river.valid.json',
  });
});

Given('I want to run a river that is already running', () => {
  cy.interceptApi(modifyRiver, 'rivers-list/simple-river.valid.json');
  cy.interceptPostApi1(runRiver, 'run/run.POST.skipped.json', 201);
});

Given('I want to run a river that with a run error', () => {
  cy.interceptApi(modifyRiver, 'rivers-list/simple-river.valid.json');
  cy.interceptPostApi1(runRiver, 'run/run.POST.error.json', 201);
});

When('run has completed', () => {
  cy.waitApi(runRiver);
});
When('river has started polling for result', () => {
  wait(checkRun);
});

When('river check run is running', () => {
  cy.interceptGetApi1(checkRun,'run/check.run.result.R.json', 200, checkRun);
});

When('river run has ended successfully', () => {
  cy.interceptGetApi1(checkRun,'run/check.run.success.json', 200, checkRun);
});

When('river run has failed', () => {
  cy.interceptGetApi1(checkRun,'run/check.run.result.failed.json', 200, checkRun);
});

When('I want to cancel a run', () => {
  cy.interceptPostApi1(cancelRun,'run/run.cancel.json', 202, cancelRun);
});

When('I wait for river run to be canceled', () => {
  wait(cancelRun);
});

const waitModifyRiver = () => {
  wait(modifyRiver);
}
When('the river save request is completed', waitModifyRiver);
When('the river save request is successful', waitModifyRiver);
When('I run river', () => {
  cy.clickButton('Run');
})
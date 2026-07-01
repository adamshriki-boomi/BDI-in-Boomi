import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const MONITORING_URL = 'activities/account1/faked-env-1/activities';
const ACTIVITIES = `activities?*`;
const ACTIVITIES_GRAPH = 'activities_graph'
const ACTIVITIES_STATS = `activities_statistics?*`;
const ACTIVITIES_SCHEDULERS = `activities_run_groups?*`
const LOGIC_STEPS = `logic_steps`
const RUNS = `runs?*`
const RUNS_SINGLE = 'runs/8783f1f8c8ff4ea393675b8ec3949ebb'
const LOGIC_RUNS_SINGLE = 'runs/a4eefdec04854e56bfa50694f4e4c3d2'
const ACTION_RUNS = `runs`
const LOGS = `activities/runs/logs?*`
const TASKS = `tasks`
const FETCH_RIVER = `rivers/list`
const RETRY = `retry`
const SUB_RIVERS = `activities_sub_rivers*`

Given('I want to see activities', () => {
  cy.interceptGetApi1(ACTIVITIES, 'activities/get.activities.last_runs.json');
  cy.interceptGetApi1(ACTIVITIES_STATS, 'activities/get.activities_statistics.json');
  cy.interceptPostApi1(ACTIVITIES_GRAPH, 'activities/post.activities_graph.json');
});

Given('I want to see Logic activities', () => {
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.logic.activities_schedulers.json');
  cy.interceptGetApi1(LOGIC_RUNS_SINGLE, 'activities/get.logic_runs.json');
  cy.interceptGetApi1(LOGIC_STEPS, 'activities/get.logic_steps.json');
 
});

Given('I want to see Logic activities for river with numbers only id', () => {
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.logic.activities_schedulers.json');
  cy.interceptGetApi1(LOGIC_RUNS_SINGLE, 'activities/get.logic_runs.json');
  cy.interceptGetApi1(LOGIC_STEPS, 'activities/get.logic_steps.numbers.json');
 
});

Given('I want to see S2T activities', () => {
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_s2t_river.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.s2t.activities_schedulers.json');
  cy.interceptGetApi1(RUNS, 'activities/get.s2t_runs.json');
  cy.interceptGetApi1(TASKS, 'activities/get.s2t_tasks.json');
  cy.interceptGetApi1(RUNS_SINGLE, 'activities/get.s2t_run_data.json');
  cy.interceptGetApi(LOGS, 'activities/download_logs_1.json');
});


Given('I want to see S2T sub river activities', () => {
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_s2t_sub.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.subriver.activities_schedulers.json');
  cy.interceptGetApi1(SUB_RIVERS, 'activities/get.sub_rivers.json');
  cy.interceptGetApi1(RUNS, 'activities/get.s2t_runs.json');
});

Given('I want to see failed S2T activities', () => {
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_s2t_river.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.s2t.activities_schedulers.json');
  cy.interceptGetApi1(RUNS, 'activities/get.s2t_failed_runs.json');
  cy.interceptPostApi(RETRY, 'activities/post.retry.json');
});


Given('Download was completed', () => {
  cy.interceptGetApi(LOGS, 'activities/download_logs_2.txt');
})

Given('I want to see Action activities', () => {
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_action_river.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.action.activities_schedulers.json');
  cy.interceptGetApi1(`${ACTION_RUNS}/4f3b0c69b2a94bb4b518dcbd55bf8aa4`, 'activities/get.action_runs.json');
  cy.interceptGetApi1(TASKS, 'activities/get.action_tasks.json');
});

Given('I want to see failed Action activities', () => {
  cy.interceptPostApi(FETCH_RIVER, 'activities/post.fetch_action_river.json');
  cy.interceptGetApi1(ACTIVITIES_SCHEDULERS, 'activities/get.action.activities_schedulers.json');
  cy.interceptGetApi1(`${ACTION_RUNS}/def2980ed4764a37bffd6e739d24b2cd`, 'activities/get.action_failed_runs.json');
  cy.interceptGetApi1(TASKS, 'activities/get.action_failed_tasks.json');
});

Given('I want to see no activities message', () => {
  cy.interceptGetApi1(ACTIVITIES, 'activities/get.activities.empty.json', 500);
  cy.interceptGetApi1(ACTIVITIES_STATS, 'activities/get.activities_statistics.empty.json', 500);
});

Given('The logic river id contains numbers only', () => {
  cy.interceptPostApi('/list', 'river.id-numbers-only.list')
})

When('activities data has completed loading', () => {
  cy.wait(`@${ACTIVITIES}`);
  cy.wait(`@${ACTIVITIES_STATS}`);
});

When('Graph has completed loading', () => {
  cy.wait(`@${ACTIVITIES_GRAPH}`);
})

When('Runs table has completed loading', () => {
  cy.wait(`@${RUNS}`);
})
When('I select {string} in Status', (optionName:string) => {
  cy.listbox('status', optionName);
});
When('I select {string} in Scheduled', (optionName:string) => {
  cy.listbox('is_scheduled', optionName);
});
When('I select {string} in Groups', (optionName:string) => {
  cy.listbox('group_id', optionName);
});
When('Activities Schedulers have completed loading', () => {
  cy.wait(`@${ACTIVITIES_SCHEDULERS}`);
})
When('Activities Sub Rivers have completed loading', () => {
  cy.wait(`@${SUB_RIVERS}`);
})
const Filters = {
  Group: 'group_id',
  Schedule: 'is_scheduled',
  Status: 'status'
}
Then('I see results filtered by {string} with {string}', (filter:string, status:string) => {
  cy.wait(`@${ACTIVITIES}`).then((config) => {
    // this is because there's already a first wait
    if (config.request.url.includes(Filters[filter])) {
      expect(config.request.url).to.contain(`${Filters[filter]}=${status}`)
    }
  })
});

Then('I see in url all default filters', () => {
  cy.location('href').then(href => {
    ['end_time', 'start_time'].forEach(filter => {
      expect(href).to.contain(filter);
    })
  })
});


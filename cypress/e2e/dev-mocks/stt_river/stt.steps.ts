import { Given, Step, When } from '@badeball/cypress-cucumber-preprocessor';

Given('I get data flow', () => {
  cy.interceptRiversGetV1('stt/stt.river.v1.json');
})

Given('I get cdc data flow', () => {
  cy.interceptRiversGetV1('stt/stt.cdc.river.v1.json');
})

Given('I want to view source to target flow', () => {
  cy.interceptRiver('stt/stt.river.json');
  Step(this, "I get data flow");
  cy.interceptApi('river_groups*', 'river_groups/get.json');
  cy.interceptGetApi1('*operations*', 'metadata/long_running.json');
  Step(this, 'I want to see activities');
});

Given('I want to view cdc source to target flow', () => {
  cy.interceptRiver('stt/stt.cdc.river.v1.json');
  Step(this, "I get cdc data flow");
  cy.interceptApi('river_groups*', 'river_groups/get.json');
  cy.interceptGetApi1('*operations*', 'metadata/long_running.json');
  Step(this, 'I want to see activities');
});

Given('I want to view disabled source to target flow', () => {
  cy.interceptRiver('stt/stt.river.json');
  cy.interceptRiversGetV1('stt/stt.disabled_river.v1.json');
  cy.interceptApi('river_groups*', 'river_groups/get.json');
  Step(this, 'I want to see activities');
});

Given('I want to see schemas', function () {
  cy.interceptGetApi1('*schemas*', 'connections/stt/schemas.all.json');
  Step(this, 'I want see all tables');
});

Given('I want see all tables', () => {
  cy.interceptGetApi1('*tables*', 'connections/stt/tables.all.json');
});

Given('I want to search for schemas', function () {
  cy.interceptGetApi1('*schemas*schema_name=*', 'connections/stt/schemas.schema_name=.json');
});

Given('I want to search for tables', function () {
  cy.interceptGetApi1('*tables*table_name=*', 'connections/stt/tables.table_name=.json');
});

Given('I want to see the next page in tables', function () {
  cy.interceptGetApi1('*tables*next_page_id=*', 'connections/stt/tables.next_page.json');
});

Given('I want to see the next page while a search term exists', function () {
  cy.interceptGetApi1('*tables*', 'connections/stt/tables.table_name+next_page.json');
});

Given('I want see selected tables', () => {
  cy.interceptGetApi1('*tables*table_ids=or_test_epoch*', 'connections/stt/tables.selected.json');
});

Given('I get shopify_graphql data flow', () => {
  cy.interceptRiversGetV1('stt/stt.shopify_graphql.river.v1.json');
});

Given('I want to view shopify_graphql source to target flow', () => {
  cy.interceptRiver('stt/stt.river.json');
  Step(this, 'I get shopify_graphql data flow');
  cy.interceptApi('river_groups*', 'river_groups/get.json');
  cy.interceptGetApi1('*operations*', 'metadata/long_running.json');
  Step(this, 'I want to see activities');
});

Given('I want to see increment required tables', () => {
  cy.interceptGetApi1('*tables*', 'connections/stt/tables.increment-required.json');
  cy.interceptGetApi1('*tables*tables_ids=table_no_increment*', 'connections/stt/tables.single.table_no_increment.json');
});

Given('I want to view a source to target flow with cdc-eligible and non-eligible tables', () => {
  cy.interceptRiver('stt/stt.river.json');
  cy.interceptRiversGetV1('stt/stt.cdc-filter.river.v1.json');
  cy.interceptApi('river_groups*', 'river_groups/get.json');
  cy.interceptGetApi1('*operations*', 'metadata/long_running.json');
  Step(this, 'I want to see activities');
});

Given('I want to see cdc filter tables', () => {
  cy.interceptGetApi1('*tables*', 'connections/stt/tables.cdc-filter.json');
});

Given('I want to edit table settings', () => {
  cy.interceptGetApi1('*columns?table_id=*', 'connections/stt/columns.table_id.json');
})

Given('I want to save s2t data flow', () => {
  cy.interceptRiversPostV1('stt/stt.river.v1.json');
})

Given('I want to modify s2t data flow', () => {
  cy.interceptRiversPutV1('stt/stt.river.v1.json');
})


When('I navigate to Stt data flow', () => {
  cy.rivery('rivers/account1/faked-env-1/1234/BETA_STT')
});

When('I click create Stt data flow', () => {
  cy.visit('rivers/account1/faked-env-1/new/source-to-target')
});

Given('I want to set MySql as a connection', () => {
  cy.interceptConnection('mysql', 'stt/connections.connection_type=mysql.json')
});

Given('I want to set Snowflake as a connection', () => {
  cy.interceptConnection('snowflake', 'stt/connections.connection_type=snowflake.json')
});

Given('I want to run new s2t data flow', () => {
  cy.interceptPutApi1('*63fe022f882b2c0012554eb0', 'run/run_stt_river/river_update_response.json')
  cy.interceptPutApi1('*63fe022f882b2c0012554eb0/variables', 'run/run_stt_river/variables_empty.json')
  cy.interceptPostApi1('*63fe022f882b2c0012554eb0/run', 'run/run_stt_river/run_success_response.json')
})

Given('Data Flow is set to run and pending', () => {
  cy.interceptGetApi1('*runs/*', 'run/run_stt_river/run_pending.json')
})

Given('Data Flow is running', () => {
  cy.interceptGetApi1('*runs/*', 'run/run_stt_river/run_running.json')
  cy.interceptGetApi1('*activities_run_groups/*', 'run/run_stt_river/run_tables.json')
  // cy.interceptGetApi1('*tasks', 'run/run_stt_river/run_tasks.json')
  // cy.interceptGetApi1('*tasks', 'run/run_stt_river/run_tables.json')
})

Given('Data Flow has finished successfully', () => {
  cy.interceptGetApi1('*runs/*', 'run/run_stt_river/run_finished_successfully.json')
cy.interceptGetApi1('*activities_run_groups/*', 'run/run_stt_river/run_tasks_done.json')
  cy.interceptGetApi1('*tasks', 'run/run_stt_river/run_tables_done.json')
})

Given('I want to add variables to my data flow', () => {
  cy.interceptPutApi1('*63fe022f882b2c0012554eb0', 'run/run_stt_river/river_update_response.json')
  cy.interceptPutApi1('*variables', 'river-variables/stt_variables/add_variables.json')
})

Given('I want to set DB and schema', () => {
  cy.interceptPostApi1('*/pull_requests','pull/post.pull.v1.db.json')
  cy.interceptGetApi('*/connections?_id=*', 'connections/connections._id=snowflake.get.json')
  cy.interceptGetApi1('*operations/*', 'metadata/get.db.v1.json')
})

Given("I want to disable data flow", () => {
  cy.interceptPostApi1('*disable_river', 'run/run_stt_river/activate_cdc.json')
  cy.interceptGetApi1('*operations/*', 'run/run_stt_river/poll_cdc_w.json')
})

Given ("all target fields were loaded", () => {
  cy.wait('@targetTypes')
  cy.wait(500)
})
Given('I want to activate cdc', () => {
  cy.interceptPostApi1('*activate_river', 'run/run_stt_river/activate_cdc.json')
  cy.interceptGetApi1('*operations/*', 'run/run_stt_river/poll_cdc_w.json')
})

Given('I want to delete cdc config', () => {
  // I needed an empty Response, dont mind the wrong fixture name
  cy.interceptDeleteApi1('*cdc_config', 'rivers-list/river.last-runs.json')
})

Given('CDC activation succeeded', () => {
  cy.interceptGetApi1('*operations/*', 'run/run_stt_river/poll_cdc_d.json')
})

Given('data flow was disabled', () => {
  cy.interceptGetApi1('*operations/*', 'run/run_stt_river/poll_cdc_d.json')
  cy.interceptRiversGetV1('stt/stt.disabled_river.v1.json');
})

Given('I checked multiple tables and opened bulk menu', () => {
  Step(this, "I click 'crown'")
  Step(this, "I check 'select table NewTable2'");
  Step(this, "I check 'select table NewTable test space'");
  Step(this, "I click button 'Bulk Actions'");
});

When('I setup source and target', ()=> {
   // No need to test the following steps every run
  Step(this, "I see 'integrations'");
  Step(this, "I don't see text 'Actions'"); //test sec_hidden sources are hidden
  Step(this, "I type 'mysql' to 'search'");
  Step(this, "I click 'MySQL'");
  // Step(this, "I don't see button 'Back'");
  Step(this, "I wait 1500")
  Step(this, "I select item 'test-timeout' in list 'connections'");
 
  // Step(this, "I want to test a connection");
  // Step(this, "I click button 'Test Connection'")
  // Step(this, "I see 'Connection Tested Successfully'");
  Step(this, "I click 'Next'");
  Step(this, "I type 'snowflake' to 'search'");
  Step(this, "I click 'Snowflake'");
  Step(this, "I want to set DB and schema");
  Step(this, "I select item 'Rivery Snowflake' in list 'connections'");
  // Step(this, "I want to test a connection");
  // Step(this, "I click button 'Test Connection'")
  // Step(this, "I see 'Connection Tested Successfully'");
  Step(this, "I click label 'refresh-metadata' at index 0")
  Step(this, "I want to set DB and schema");
  Step(this, "I wait 1500");
  Step(this, "I select item 'DEMO_DB' in list 'database_name'");
  // Step(this, "I click label 'refresh-metadata' at index 1")
  Step(this, "I select item 'DEMO_DB' in list 'schema_name'")
  Step(this, "I click 'Next'");
  Step(this, "I see 'Standard Extraction'");
  Step(this, "I click 'Standard Extraction'");
  Step(this, "I click 'Configure Schema'")
  Step(this, "I see 'crown'")
  Step(this, "I click 'crown'")
});


When('I setup cdc source and target', ()=> {
  Step(this, "I see 'integrations'");
  Step(this, "I type 'mysql' to 'search'");
  Step(this, "I click 'MySQL'");
  Step(this, "I wait 1500")
  Step(this, "I select item 'test-timeout' in list 'connections'");
  // Step(this, "I want to test a connection");
  // Step(this, "I click button 'Test Connection'")
  Step(this, "I click 'Next'");
  Step(this, "I type 'snowflake' to 'search'");
  Step(this, "I click 'Snowflake'");
  Step(this, "I want to set DB and schema");
  Step(this, "I select item 'Rivery Snowflake' in list 'connections'");
  // Step(this, "I want to test a connection");
  // Step(this, "I click button 'Test Connection'")
  // Step(this, "I see 'Connection Tested Successfully'");
  Step(this, "I click label 'refresh-metadata' at index 0")
  Step(this, "I want to set DB and schema");
  Step(this, "I wait 1500");
  Step(this, "I select item 'DEMO_DB' in list 'database_name'");
  // Step(this, "I click label 'refresh-metadata' at index 1")
  Step(this, "I select item 'DEMO_DB' in list 'schema_name'")
  Step(this, "I click 'Next'");
  Step(this, "I click force text 'CDC (Change Data Capture)'");
});



When('I setup a new s2t data flow', function () {
  Step(this, "I setup source and target")
  Step(this, "I want to edit table settings")
  Step(this, "I see 'or_test_epoch'")
  Step(this, "I click label 'select table or_test_epoch'")
  Step(this, "I see button 'or_test_epoch'")
  Step(this, "I click button 'or_test_epoch'")
  Step(this, "I see 'Mapping of the table columns, including their respective data types, mode and more.'")
})

When('data source types have loaded', () => {
  cy.waitApi("datasource_types/all")
})

When('I see no selected tabled', () => {
  cy.get('[class="chakra-text"]').contains('00')
})

Given('I want to create a source to target flow', function() {
  // Step(this, "I am signed in a pro user to the app");
  // Step(this, "I want to suppress errors");
  Step(this, "I want to see rivers of all types");
  Step(this, "I want to view source to target flow");
  Step(this, "I want to see schemas");
  Step(this, "I want to set MySql as a connection");
  Step(this, "I want to set Snowflake as a connection");
  Step(this, "I click create Stt data flow");
  Step(this, "I see 'Set Up Data Source'");
});

Given("I want to test a connection", () => {
  cy.interceptApi('connections/test*', 'connections/test.json');
  cy.interceptApi('pull_test_connection?*', 'connections/stt/pull_test_connection.Done.json');
})

Given('I open table {string} and expect to see loading mode {string} is selected in list {string}', (table: string, loadingMode: string, list: string) => {
  Step(this, `I click button "${table}"`);
  Step(this, `I select tab "Table Target Settings"`);
  Step(this, `I see value "${loadingMode}" is selected in list "${list}"`)
  Step(this, `I click button "Cancel"`);
});

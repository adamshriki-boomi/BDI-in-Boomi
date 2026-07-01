import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const SNOWFLAKE_CONNECT_URL =
  '/#/?sfConnectSignup&token=fakeToken&first_name=John&last_name=doe&account_name=rivery_partner221322.snowflakecomputing.com&email=tester@rivery.io&database=RIVERY_DB&schema=PUBLIC';

const DATABRICKS_CONNECT_URL =
  '/#/?partnerConnect=eyJmaXJzdF9uYW1lIjogIlNoaXJhbiIsICJsYXN0X25hbWUiOiAiQ29oZW4iLCAiZGF0YXNvdXJjZV9pZCI6ICIiLCAiZGF0YWJhc2UiOiAiIiwgImNvbm5lY3Rpb25faWQiOiAiNjIwNTY2OGYxOTY5NGEyMWRjZTFjOThmIiwgInRva2VuIjogImZha2VUb2tlbiIsICJ1c2VyX2V4aXN0cyI6ICIiLCAicGFydG5lciI6ICJkYXRhYnJpY2tzIiwgImVtYWlsIjogImJyaXZlcnl0ZXN0MTIzQGRhdGFicmlja3MuY29tIiwgImRhdGFicmlja3NfdXNlcl9pZCI6ICI0MTE3MjU0MTU4MjkxMjM0OCIsICJzY2hlbWEiOiAiIn0=';
//////////////////
// Arrangements //
//////////////////
Given('I signed up with snowflake', () => {
  cy.interceptPostApi('login', 'empty.response.json');
  cy.interceptPostApiAs(
    'register/snowflake/finish/fakeToken*',
    'register/register.sf.finish.api.json',
    'registerPartner',
  );
});
Given('I signed up with databricks', () => {
  cy.interceptPostApi('login', 'empty.response.json');
  cy.interceptPostApiAs(
    'register/databricks/finish/fakeToken*',
    'register/register.databricks.finish.api.json',
    'registerPartner',
  );
});

Then("I select country", () => {
    cy.listbox('Country', 'Israel');
})

////////////////
// Assertions //
////////////////
Then('I see options to create river', () => {
  cy.wait('@registerPartner');
  cy.findByText(/Create Data Pipelines & Workflows/gi).should(
    'be.visible',
  );
  cy.findLink('src_to_fz').should('be.visible');
  cy.findLink('logic').should('be.visible');
});

Then('I am logged in to the app', () => {
  cy.wait('@postToken');
  cy.findByText(/new river/gi).should('be.visible');
  cy.findByRole('application', { name: 'old-app' })
    .should('have.attr', 'src')
    .and(
      'match',
      /.*(getting_started=true|selected_river_type=src_to_trgt|target=snowflake).*/gi,
    );
});
/////////////
// Actions //
/////////////
When('I open the snowflake signup link', () => {
  cy.rivery(SNOWFLAKE_CONNECT_URL);
});

When('I open the databricks signup link', () => {
  cy.rivery(DATABRICKS_CONNECT_URL);
});

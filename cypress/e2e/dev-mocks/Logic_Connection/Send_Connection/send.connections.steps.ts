import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { interceptSnowflake } from "../../common/connectionEditor.steps";
import { createConnectionUrl } from "../Create_Connection/save-connection.steps";

Given('I want to create a connection from a url', () => {
  // WHY? test went into an infinite loop with login/logout requests
  // probably because the react-app was loaded into the iframe
  cy.intercept('/ng', {
    body: {},
  });

});

When('I navigate to shared connection url', () => {
  cy.wait(1000)
  cy.clearCookies();
  cy.clearLocalStorage();
  interceptSnowflake();
  cy.interceptApi('*connection/get_details*','connections/get_details.success.json' ,200);

  const url = `https://console.dev.rivery.in/#/?create_connection=faked&token=faked`;
  cy.visit(url);
});
When('I navigate to expired shared connection url', () => {
  cy.wait(1000)
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.interceptApi('*connection/get_details*','connections/get_details.fail.json' ,400);
  const url = `https://console.dev.rivery.in/#/?create_connection=faked&token=expired`;
  cy.visit(url);
});


Then('the new snowflake connection is saved successfully', () => {
  cy.wait(`@${createConnectionUrl}`).then(({ request }) => {
    const params = {
      // make sure the value should be number
      username: "Username"
    }
    Object.entries(params)
      .forEach(([key, value]) => expect(request?.body).to.have.property(key, value));
  });
});
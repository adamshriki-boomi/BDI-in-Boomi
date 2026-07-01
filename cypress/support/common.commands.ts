export * as rtl from '@testing-library/cypress/add-commands';
declare global {
  namespace Cypress {
    interface Chainable {
    clickButton: typeof clickButton;
    clickLink: typeof clickLink;
    forceClickLink: typeof forceClickLink;
    findLink: typeof findLink;
    /**
     * finds a role=button element
     * @param name aria-label value
     */
    findButton: typeof findButton;
    findMenuItem: typeof findMenuItem;
    seeInUrl: typeof seeInUrl;
    dontSeeInUrl: typeof dontSeeInUrl;
    oldApp(): Chainable<JQuery>;
    oldAppLoaded: typeof oldAppLoaded;
    oldIframeContent: typeof oldIframeContent;
    getIframeWindow: typeof getIframeWindow;
    getIframeBody: typeof getIframeBody;
    getIframeBodyWrapped: typeof getIframeBodyWrapped;
    selectRadio: typeof selectRadio;
    selectRadioList: typeof selectRadioList;
    findRadioList: typeof findRadioList;
    checkCheckbox: typeof checkCheckbox;
    toggleRealSwitch: typeof toggleRealSwitch;
    toggleSwitch: typeof toggleSwitch;
    findCheckedCheckbox: typeof findCheckedCheckbox;
    findUncheckedCheckbox: typeof findUncheckedCheckbox;
    uncheckCheckbox: typeof uncheckCheckbox;

    }
  }
}
const clickButton = (name: string | RegExp, options = {}) => {
  return cy.findButton(name, options).click({ scrollBehavior: 'center' });
};
Cypress.Commands.add('clickButton', clickButton);

const selectRadio = (name: string | RegExp, value, options = {}) => {
  cy.findByRole('radiogroup', { name, ...options }).within(() => {
    cy.findByText(value).click();
  });
};
Cypress.Commands.add('selectRadio', selectRadio);

const findRadioList = (name: string | RegExp, value, options = {}) => {
  cy.findByRole('radiogroup', { name, ...options }).within(() => {
    cy.findByRole('radio', { name: value });
  });
};
Cypress.Commands.add('findRadioList', findRadioList);

const selectRadioList = (name: string | RegExp, value, options = {}) => {
  cy.findByRole('radiogroup', { name, ...options }).within(() => {
    cy.findByText(value).click();
  });
};
Cypress.Commands.add('selectRadioList', selectRadioList);

const findCheckedCheckbox = (name: string | RegExp) => {
  return cy
    .get(`[type='checkbox'][aria-label='${name}']`)
    .should('be.checked');
};
Cypress.Commands.add('findCheckedCheckbox', findCheckedCheckbox);

const findUncheckedCheckbox = (name: string | RegExp) => {
  return cy
    .get(`[type='checkbox'][aria-label='${name}']`).should('exist')
    .should('not.be.checked');
};
Cypress.Commands.add('findUncheckedCheckbox', findUncheckedCheckbox);

const checkCheckbox = (name: string | RegExp) => {
  return cy
    .get(`[type='checkbox'][aria-label='${name}']`).check({force:true})
};
Cypress.Commands.add('checkCheckbox', checkCheckbox);

const toggleSwitch = (name: string | RegExp) => {
  return cy
  .get(`div[role=group][data-cy="${name}"]`).within(() => {
    cy.findByText(name).click()
  })
};
Cypress.Commands.add('toggleSwitch', toggleSwitch);

const uncheckCheckbox = (name: string | RegExp) => {
  return cy
    .get(`[type='checkbox'][aria-label='${name}']`).uncheck({force:true})
};
Cypress.Commands.add('uncheckCheckbox', uncheckCheckbox);


const toggleRealSwitch = (name: string | RegExp) => {
  return cy
    .get(`.chakra-stack:has([aria-label='${name}'])`)
    .realClick({ scrollBehavior: 'center' });
};
Cypress.Commands.add('toggleRealSwitch', toggleRealSwitch);

const findLink = (name: string) => {
  return cy.findByRole('link', { name });
};
Cypress.Commands.add('findLink', findLink);

const clickLink = (name: string | RegExp) => {
  return cy.findByRole('link', { name }).click();
};
Cypress.Commands.add('clickLink', clickLink);

const forceClickLink = (name: string | RegExp) => {
  return cy.findByRole('link', { name }).click({force:true});
};
Cypress.Commands.add('forceClickLink', forceClickLink);
/**
 * clicks a role=button element with aria-label
 * @param name aria-label value
 */
const findButton = (name: string | RegExp, options = {}) => {
  return cy.findByRole('button', { name, ...options });
};
Cypress.Commands.add('findButton', findButton);

/**
 * clicks a role=button element with aria-label
 * @param name aria-label value
 */
const findMenuItem = (name: string | RegExp, options = {}) => {
  return cy.findByRole('menuitem', { name, ...options });
};
Cypress.Commands.add('findMenuItem', findMenuItem);
/**
 * see partially the path in url
 * @param path a pathname in url
 */
const seeInUrl = (path: string) => {
  cy.location('href').should('contain', path);
};
Cypress.Commands.add('seeInUrl', seeInUrl);

const dontSeeInUrl = (path: string) => {
  cy.location('pathname').should('not.contain', path);
};
Cypress.Commands.add('dontSeeInUrl', dontSeeInUrl);
/**
 * finds the iframe that's loading the old app (angularjs)
 */
const oldApp = () => {
  cy.findByRole('application', { name: 'old-app' });
};
Cypress.Commands.add('oldApp', oldApp);
/**
 * verifies old app is loading the url
 * @param url a complete/partial url
 */
const oldAppLoaded = (url: string | RegExp) => {
  cy.oldIframeContent().its('location.href').should('include', url);
};
Cypress.Commands.add('oldAppLoaded', oldAppLoaded);

const oldIframeContent = () =>
  cy
    .get('iframe[role="application"][aria-label="old-app"]')
    .its('0.contentWindow');
Cypress.Commands.add('oldIframeContent', oldIframeContent);

// ref: https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
/**
 * returns the oldApp's iframe window and verifies it is rendered
 * reedy to be used with cypress commands
 */
const getIframeWindow = () =>
  cy.oldApp().its('0.contentWindow').should('not.be.empty');
Cypress.Commands.add('getIframeWindow', getIframeWindow);
/**
 * returns a wrapped oldApp iframe's body
 * ready to be used with cypress commands
 */
const getIframeBodyWrapped = () =>
  cy.oldApp().then($iframe => {
    const $body = $iframe.contents().find('body');
    cy.wrap($body).wait(2000);
  });
Cypress.Commands.add('getIframeBodyWrapped', getIframeBodyWrapped);

const getIframeBody = () =>
  cy
    .oldApp()
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(body => cy.wrap(body, { log: false }));
Cypress.Commands.add('getIframeBody', getIframeBody);




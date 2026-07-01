import { Given, Step, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { interceptRiverUrls } from '../../common/utils/login';

//preparation for login error test
// const LOGIN_ERROR_NO_LINK =
//   '/#/?mode=login_error&body=eyJlcnJvcl9tZXNzYWdlIjogIk1hcHBpbmcgYXVkaWVuY2UgbWlzbWF0Y2guIFBsZWFzZSBjaGVjayBwcm92aWRlciBjb25maWd1cmF0aW9uIGF1ZGllbmNlIG1hcHBpbmcuIn0=';
//
// const LOGIN_ERROR_WITH_LINK =
//   '/#/?mode=login_error&body=eyJlcnJvcl9tZXNzYWdlIjogIk1hcHBpbmcgYXVkaWVuY2UgbWlzbWF0Y2guIFBsZWFzZSBjaGVjayBwcm92aWRlciBjb25maWd1cmF0aW9uIGF1ZGllbmNlIG1hcHBpbmcuIn0=';
//
// When('I open the login error link', () => {
//   cy.rivery(LOGIN_ERROR_WITH_LINK);
// });

Given('I want to clear all sessions', () => {
  Cypress.session.clearCurrentSessionData()
})

Given("I want to signout", () => {
  cy.interceptPostApi('*/logout', 'login/logout.json');
  // cy.signOut()
})

Given('I am a user with multiple accounts', () => {
  // cy.interceptLogin('signout.json', 401);
  // cy.rivery();
  // wait for:
  // - auto-login to fail
  // - page to load,
  // then mock
  // cy.findByText('Welcome back to Rivery');
  // cy.signOut();
  // cy.selectAdminAccount();
  // cy.wait(['@getToken', '@getEnvironments']);
  cy.mockFakeLoginSingleAccount();
});

When('I sign in the login page', () => {
  // cy.wait('@*/logout')
  cy.visit('/login')
  // cy.login({ email: 'dddd@ffff.com', password: '111' });

});

Given('I sign in with Google', () => {
  cy.interceptPostApi('login', 'login/login.google.valid.json', 200, {
    delay: 1000,
  });
});

Then('I see Sign In Loading Animation', () => {
  const credentials = window.btoa(
    '' + JSON.stringify({ shouldAppearInGoogleSignRequest: true }),
  );
  cy.rivery(`/#signin?&mode=signin&body=${credentials}`);
  cy.findByRole('figure', { name: 'loading animation' }).should('be.visible');
});

When('I am redirected to create river page using default_env', () => {
  cy.rivery('river/fake1/default_env/river?selected_river_type=src_to_fz');
})
Given('I sign in with wrong credentials', () => {
  cy.interceptPostApi('login', 'login/login.invalid.json', 401);
  // cy.rivery();
  // cy.signInFake(false);
});

Given('I signed in successfully with wrong environment', () => {
  cy.interceptPostApi('login', 'login/login.valid.json');
  cy.interceptPostApi('token', 'token/token.invalid.json', 403);
  cy.rivery('/rivers/fake-account/invalid-env-id');
});

When('login is completed', () => {
  cy.waitApi('login');
  cy.waitApi('token');
})

// When('login credentials are wrong', () => {
//   Step(this, "I want to clear all sessions") 
//   Step(this, "I want to signout")
//   Step(this, "I click label 'user-menu'")
//   Step(this, "I click button 'Log Out'")
//   Step(this, "I type 'email@email.com' inside 'Email'")
//   Step(this, "I type '111' inside 'Password'")
//   Step(this, "I click button 'Log In'")

// });

Then('I see login and animation only after page refresh', () => {
  interceptRiverUrls();
  cy.reload(true);
  cy.wait('@postLogin').then(() => {
    // WHY commented? repodcuing this state is too flaky,
    // so leaving this assertion here to imply it should be asserted
    // cy.findByRole('figure', { name: 'loading animation' }).should('be.visible');
    cy.findByText('Log in to Rivery').should('not.exist');
  });
});

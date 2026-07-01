import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const signupApi = 'signup/password';
const registerApi = 'register';
const fakedAccountEnv = '56643e6770ec07e624d43351/faked-env-1';

//////////////////
// Arrangements //
//////////////////
Given('I want to signup with a new user', () => {
  cy.interceptPostApi('login', 'empty.response.json');
  cy.interceptApiBody(signupApi, {
    ok: true,
    registration: true,
    token: 'fake_token',
    user_email: 'demon@ofthe.fall@rivery.io',
    user_id: 'fake_id_1112',
  });
  cy.rivery();
});
Given('I want to signup with an existing user', () => {
  cy.interceptPostApi('login', 'empty.response.json');
  cy.interceptApiBody(
    signupApi,
    {
      message: 'User already exists. Please login.',
      ok: true,
      status: 'Exists',
    },
    409,
  );
  cy.rivery();
});

Given('I want to continue with free trial and verify my email', () => {
  cy.interceptPutApi(registerApi, 'register/register.valid.verify.json');
  fillNewAccountFields();
});
Given('I want to continue with free trial', () => {
  cy.interceptPutApi(registerApi, 'register/register.valid.json');
  fillNewAccountFields();
});
Given('I want to continue with free trial but I get server error', () => {
  cy.interceptPutApi(registerApi, 'register/register.invalid.json');
  fillNewAccountFields();
});
Given('my new account has logged in', () => {
  cy.interceptPostApi('login', 'login/login.single.valid.json');
  cy.interceptToken();
});
Given('I sign up with google', () => {
  cy.interceptPostApi('login', 'empty.response.json');
});

/////////////
// Actions //
/////////////
When('Signup process completes', () => {
  cy.wait(`@${signupApi}`);
});

When('free trial getting started is successful', () => {
  cy.wait(`@${registerApi}`).then(({ request }) => {
    expect(request.headers).to.have.property('authorization', 'fake_token');
  });
});
When('I have logged in successfully', () => {
  cy.waitMany(['login']);
});
When('google signup redirects to the app', () => {
  const params = {
    first_name: 'John',
    last_name: 'Doe',
    user_id: 'fake_id',
    google_signup: true,
    token: 'fake_token',
    registration: true,
    user_email: 'signup.rivery@gmail.com',
  };
  const url = `/#/?${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
  cy.rivery(url);
});
When('I click "Verify Your Email" from my email', () => {
  cy.rivery(
    '/#/?getting_started=true&user_email=tester@rivery.io&account_id=fakeid33231',
  );
});
////////////////
// Assertions //
////////////////
Then('I see the onboarding screen', () => {
  cy.findByText(
    'Get all your data into your cloud data warehouse: integrate, orchestrate, and transform at unlimited scale.',
  );
});
Then('I see the Start your free trial screen', () => {
  cy.findByText('Welcome to Data Integration (Rivery)');
  cy.findByText('To set up your account, let’s start with some basics:');
  // cy.findByText('Need help?');
  // cy.findByText('Contact Support');
  cy.findButton('Get Started');
});

Then('I see the Create Data Source To Target screen for my new account', () => {
  cy.seeInUrl(`river/${fakedAccountEnv}/river?create_first_river=true`);
});
Then('I see the Dashboard screen for my new account', () => {
  cy.seeInUrl(`dashboard/${fakedAccountEnv}/dashboard`);
});

//////////////////
// Interactions //
//////////////////

function fillNewAccountFields() {
  cy.findByPlaceholderText(/First Name/gi).type('rivery');
  cy.findByPlaceholderText(/Last Name/gi).type('test');
  cy.findByPlaceholderText(/Job Title/gi).type('developer');
  cy.findByPlaceholderText(/Phone Number/gi).type('123456')
  cy.findByPlaceholderText(/Company Name/gi).type('test company name');
  cy.listbox('Country', 'Israel');
  cy.findByPlaceholderText(/Account Name/gi).type('Demon_of_the_fall');
}

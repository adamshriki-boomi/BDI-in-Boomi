Feature: Login
  As a data analyst
  I want to sign in to rivery
  So I create rivers

  # Scenario: Login with Google
  #   Given I sign in with Google
  #   Then I see Sign In Loading Animation


  Scenario: Login Errors
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'
    Given I sign in with wrong credentials
    Then I click button 'Log In'
    Then I see text "The email address and/or password you entered did not match our records."


  Scenario: Recover Password
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I click text "Forgot Password?"
    Then I see text "Reset your password"
    And I see text "Please enter the email address used to create your account"
    Then I type "email@email.com" to "Email"
    Then I see input with value "email@email.com"

  # Scenario: Display loading animation and hide login shell when login
  #   When I click link "Rivers"
  #   Then I see login and animation only after page refresh
  #   Then I see tab "Rivers List"

  Scenario: Redirect user to a specific page (default_env) after login with the url params
    When I am redirected to create river page using default_env
    Then I see login and animation only after page refresh
    Then I see iframe "old-app"
    And I see in url "fake1/faked-env-1"

  Scenario: Display Login screen when token fails
    Given I signed in successfully with wrong environment
    When login is completed
# TODO verify - this doesn't happen locally
# Then I see "Select Account"
# Then I see in url "/accounts"
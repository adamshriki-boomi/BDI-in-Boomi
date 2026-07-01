Feature: Error Fallback
  As a user,
  I want to be notified with a friendly error message,
  So I know there was an error and what to do next.

  Background:
    Given I want to test error fallback

  Scenario: Displays Friendly Error Message In A River
    Given I open a river with an error
    When I navigate to a logic river
    Given versions are loaded with corrupted data
    When I click label "versions"
    And versions requests have completed
    Then I see text "Oops... Something went wrong"
    And I see text "You may try to refresh or try again later."
    And I see text "If you need immediate help, please get in touch with our"
    And I see button "support team"
    And I see text "Thanks for your patience!"
    And I see link "Back to Homepage"

  Scenario: Displays Friendly Error Message In A River When Variables got an error
    Given I open a river with an error in variables
    When I navigate to a logic river
    Then I see text "Oops... Something went wrong"
    And I see text "You may try to refresh or try again later."
    And I see button "support team"
    And I see text "Thanks for your patience!"
    And I see link "Back to Homepage"

  Scenario: clean error after open another river
    Given I open a river with an error fallback
    When I navigate to a logic river
    Then I see text "Oops... Something went wrong"
    And I see text "You may try to refresh or try again later."
    Given I want to open a valid logic river
    When I navigate to a logic river
    Then I wait 1000
    Then I don't see text "Oops... Something went wrong"


  Scenario: clean error after open a new river
    Given I open a river with an error fallback
    When I navigate to a logic river
    Then I see text "Oops... Something went wrong"
    And I see text "You may try to refresh or try again later."
    Given I want to open a valid logic river
    When I click text "Create"
    Then I see "Create Data Pipelines & Workflows"
    When I click link with aria-label "logic"
    Then I don't see text "Oops... Something went wrong"

  Scenario: Redirect to Dashboard when Page Not Found after login
    Given I visit a non existing page "/not-found"
    When I select account
    Then I see in url "dashboard/account1/faked-env-1"

  Scenario: Displays Friendly Error for Page Not Found in deeply nested route
    Given I visit a non existing page "/not-found/x/y/z"
    Then I see text "We looked everywhere"
    And I see text "Looks like this page doesn't exist"
    And I see text "If you need immediate help, please get in touch with our"
    And I see button "support team"
    And I see link "Back to Homepage"

  # Scenario: Displays Friendly Error for River Not Found in deeply nested route
  #   Given I visit a non existing page "rivers/account1/faked-env-1/not-found/x/y/z"
  #   And I wait 5000
  #   Then I see text "We looked everywhere"
  #   And I see text "Looks like this Data Flow doesn't exist in this account or environment"
  #   And I see text "If you need immediate help, please get in touch with our"
  #   And I see button "support team"
  #   And I see link "Back to Rivers"

  Scenario: Displays Friendly Error for River Not Found
    Given I visit a non existing river
    Then I see text "We looked everywhere"
    And I see text "Looks like this Data Flow doesn't exist in this account or environment"
    And I see text "If you need immediate help, please get in touch with our"
    And I see button "support team"
    And I see link "Back to Homepage"

  Scenario: Displays Friendly Error for angular River Not Found
    Given I visit a non existing angular river
    Then I see text "We looked everywhere"
    And I see text "Looks like this Data Flow doesn't exist in this account or environment"
    And I see text "If you need immediate help, please get in touch with our"
    And I see button "support team"
    And I see link "Back to Homepage"

  Scenario: Displays Friendly Error for River Not Found with 500 error
    Given I visit to a non existing river with a 500 error
    Then I see text "We looked everywhere"
    And I see text "Looks like this Data Flow doesn't exist in this account or environment"
    And I see text "If you need immediate help, please get in touch with our"
    And I see button "support team"
    And I see link "Back to Homepage"

  Scenario: Show toast message when insufficient permissions for actions occure
    And I have no permissions
    When I click sidebar "Data Flows"
    Then I see toast with "Insufficient Permissions"

  Scenario: Show toast message when session expires and signs out
    And session has expired
    When I click sidebar "Data Flows"
    Then I see sign in page



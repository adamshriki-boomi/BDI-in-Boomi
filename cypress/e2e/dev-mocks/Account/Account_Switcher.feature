Feature: Account Switcher
  As a data analyst
  I want to switch account details
  So I can sign in to my multiple environments and accounts

  Background:
    When I click sidebar "Data Flows"

  Scenario: See accounts and environments in sidebar drawers
    Then I see text "Simple River Logic Example"
    Given I want to switch an account
    When I click Account Environment on sidebar
    When I click label "change account"
    Then I see "Back To Environments"
    When I click "Back To Environments"
    Then I see button "change account"

  Scenario: display rivers of a different account
    Then I see text "Simple River Logic Example"
    Given I want to switch an account
    When I click Account Environment on sidebar
    When I click label "change account"
    And I click button "mzgzzkotrd"
    And I click sidebar "Data Flows"
    When rivers list completed loading
    Then I see text "Another River Logic Example 2"
    And I see in url "account2/faked-env-1"

  Scenario: display rivers of a different environment
    Then I see text "Simple River Logic Example"
    Given I want to switch an environment
    When I switch Environment to "Faked Env 2"
    Then I see text "Another River Logic Example 2"
    And I see in url "account1/faked-env-2"
    # test DEV-1491
    When I switch Environment to "Faked Env 3"
    Then I see in url "account1/faked-env-3"

  # this scenario should work with rivers of old app as well (non-logic)
  Scenario: display same river in different environment
    Then I see text "Simple River Logic Example"
    Given I want to switch an environment
    And I want to see the same river in that environment
    When I click text "Simple River Logic Example"
    And I switch Environment to "Faked Env 2"
    Then I see texts "Simple River Logic Example" 2 times

  Scenario: open create a new river page and replace environment
    Given I click button "New Data Flow"
    When I click link with aria-label "logic"
    Then I see texts "Untitled Data Flow" 2 times
    When I switch Environment to "Faked Env 2"
    Then I see texts "Untitled Data Flow" 2 times

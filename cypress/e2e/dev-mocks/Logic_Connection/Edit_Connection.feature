Feature: Edit Connection - Snowflake
  As a data analyst
  I want to edit a connection
  So I could change details of an existing connection

  Background:
    When logic river page is displayed
    And I edit a snowflake connection

  Scenario: Edit Existing Connection Details
    Then I see label "Username"
    Then I see input with value "RiveryIo"
    And I see input with value "RIVERY_DEMO"
    And I see text "Connected with Google"
    And I see input with value "zn19366.eu-central-1"
    Then I type "1" inside "Username"
    When I click button "Save"
    Then connection has been edited successfully
    And the list of connections should be refreshed

  Scenario: Edit Existing Connection Details Twice
    Then I see label "Username"
    Then I see input with value "RiveryIo"
    When I type "RiveryIo Demo" inside "Username"
    And I click button "Save"
    Then connection has been edited successfully
    And the list of connections should be refreshed
    When I click button "Edit"
    Then I see the connection with the new details I have changed

  Scenario: Disable editing & testing connection when account is blocked
    Given I sign in with a blocked account
    When I reload the page
    And I click button "close"
    When I edit a snowflake connection
    Then I see button "Save" is disabled in dialog
    Then I see button "Test Connection" is disabled
    And I see switch "Custom File Zone" is on

  Scenario: Check generic form collapse + condition
    Then I see button "SSL Options"
    When I click button "SSL Options"
    Then I see text "SSL Mode"

    Then I see text "TestCondition"
    Then I type "bla" to "Warehouse"
    Then I don't see text "TestCondition"

  Scenario: Try to save protected connection
    Given I want to save a protected connection
    Then I see label "Username"
    Then I see input with value "RiveryIo"
    Then I type "1" inside "Username"
    When I click button "Save"
    Then I see text "CDC - river name"
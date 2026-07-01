Feature: Testing Connection
  Background:
    Given I want to see rivers of all types
    When I click sidebar "Data Flows"
    Given I want to view disabled source to target flow
    Given I want to see schemas
    And I want to set MySql as a connection
    And I want to set Snowflake as a connection
    Then I see "s2t demo"
    When I navigate to Stt data flow
    Then I select tab "Target"

  Scenario: Test connection
    Given I want to test source connection
    And I want to see status "W" for test connection pull request
    And I see button 'Test Connection'
    And I click button 'Test Connection'
    Then I see button "Stop Testing"
    And I see text "Testing connection"
    And I want to see status "Done" for test connection pull request
    Then I see text "Connection Tested Successfully"

  Scenario: Stop test connection
    Given I want to test source connection
    And I want to see status "W" for test connection pull request
    And I see button 'Test Connection'
    And I click button 'Test Connection'
    Then I see button "Stop Testing"
    And I see text "Testing connection"
    Given I want to cancel connection testing
    Then I click button "Stop Testing"
    And I want to see status "Error" for test connection pull request
    Then I see button 'Test Connection'

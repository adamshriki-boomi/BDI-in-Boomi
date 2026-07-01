Feature: Test Connection Google BigQuery
  As a data analyst
  I want to save my connection
  So I could save my work and continue with defining my logic river

  Background:
    Given I want to test connection
    Given I want to mock Google BigQuery sources
    When logic river page is displayed
    And I open new connection for Google BigQuery

  Scenario: Display Test Connection
    ## this will translate to the api calls and waits for it
    Then I see button "Test Connection"
    And I don't see text "Test Connection Passed!"
    And I don't see text "Error:"

  Scenario: Test Connection completes successfully
    When I click button "Test Connection"
    And I see button "Cancel Test"
    When test connection completed successfully
    Then I see text "Test Connection Passed!"
    When I click button "Test Connection"
    Then I don't see text "Test Connection Passed!"

  Scenario: Test Connection with new data
    When I type "motherbrain" to label "Project Id"
    When I click button "Test Connection"
    And I see button "Cancel Test"
    Then I see data has been sent properly
    Then I see text "Test Connection Passed!"
    When I click button "Test Connection"
    Then I don't see text "Test Connection Passed!"

  Scenario: Test Connection Cancel
    When I click button "Test Connection"
    When I click button "Cancel Test"
    Then I see button "Test Connection"

  Scenario: Test Connection fails
    When I click button "Test Connection"
    And I see button "Cancel Test"
    When test connection fails
    Then I see text "Error: Google Cloud connection Problem."


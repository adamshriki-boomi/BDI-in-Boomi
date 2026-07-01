Feature: River Schedule and Settings
  As a data analyst I want to add schedule to my river So I could reuse and automate my rivers

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading

  Scenario: Toggle schedule status on/off
    When I select tab "Settings"
    Then I see switch "Enable Schedule" is off
    When I switch "Enable Schedule"
    Then I see switch "Enable Schedule" is on

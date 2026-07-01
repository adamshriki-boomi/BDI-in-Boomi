Feature: River Run For Admin
  As an admin,
  I want to to run, save and receive feedback for the currently viewed river,
  so I can get analytics for my company

  Background:
    Given I am signed in as admin user to the app
    When I navigate to a valid logic river page as admin
    And I wait for river mocks to complete loading

  Scenario: Display message from server for run response
    Given I want to run a river that is already running
    When I run river
    And run has completed
    Then I see button "Run" is visible
    Then I see "This run was skipped"

  Scenario: Display Error message from server for run response
    Given I want to run a river that with a run error
    When I run river
    And run has completed
    Then I see button "Run" is visible
    Then I see "Rate limit exceeded: 1 per 1 minute"

  Scenario: Copy to another account is not displayed because I am a regular user
    When I click button "river Simple Valid River actions"
    Then I don't see text "copy to another account"


Feature: Action Step bar
  As a data analyst
  I want to define a Logic river step with an action
  So I could use actions inside a logic

  As a data analyst
  I want to select existing action river
  So I could reuse action which is already defined in the system

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading

  Scenario: See a dropdown list with action type river
    When I click button "Add Logic Step"
    When I select item "Action" in list "block-type-Logic-step-3"
    Then I see "Select REST Action" inside "Logic step 3 content"
    Then I see button "Edit data flow for Logic step 3" is disabled
    When I select item "1" in list "Select REST Action for Logic step 3"
    Then I see button "Edit data flow for Logic step 3" is enabled

    Then I don't see iframe "edit data flow"
    When I click button "Edit data flow for Logic step 3"
    Then I see iframe "Edit data flow "
    And I see label "right bar"
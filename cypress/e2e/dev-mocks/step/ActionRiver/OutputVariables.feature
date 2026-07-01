Feature: Output variables editor
  As a data analyst
  I want to edit the output variables of an action step
  So I could configure actions inside a logic

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading

  Scenario: See a dropdown list with action type river
    Given I will select an action river without inputs
    When I click button "Add Logic Step"
    When I select item "Action" in list "block-type-Logic-step-3"

  Scenario: Can edit selected action river output variables
    Given I will select an action river with inputs
    When I click button "Add Logic Step"
    When I select item "Action" in list "block-type-Logic-step-3"
    Then I see "Select REST Action" inside "Logic step 3 content"
    Then I see button "Edit data flow for Logic step 3" is disabled
    When I select item "MS-ACTION-INPUT ALL" in list "Select REST Action for Logic step 3"
    And I wait for action river data
    Then I don't see "collapse Output Variables" inside "Logic step 3 content"
    Then I see button "Edit data flow for Logic step 3" is enabled
    Then I click "collapse Output Variables" inside "Logic step 3 content"
    Then I see text "{OUTPUT_VAR1}"
    Then I see list "target variable {OUTPUT_VAR1}" has no selection
    Then I see placeholder "Select..." in list "target variable {OUTPUT_VAR1}"
    Then I wait 1000
    When I select item 'Create variable "{OUTPUT_VAR1}"' in list "target variable {OUTPUT_VAR1}"
    Then I see list "target variable {OUTPUT_VAR1}" has selection
    Then I see item "{OUTPUT_VAR1}" selected in list "target variable {OUTPUT_VAR1}"

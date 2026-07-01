Feature: Input variables
  As a data analyst
  I want to edit the input variables of an action step
  So I could configure actions inside a logic

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading

  Scenario: See a dropdown list with action type river
    Given I will select an action river without inputs
    When I click button "Add Logic Step"
    When I select item "Action" in list "block-type-Logic-step-3"

  Scenario: Can edit selected action river
    Given I will select an action river without inputs
    When I click button "Add Logic Step"
    When I select item "Action" in list "block-type-Logic-step-3"
    Then I see "Select REST Action" inside "Logic step 3 content"
    Then I see button "Edit data flow for Logic step 3" is disabled
    And I wait for action river data
    When I select item "MS-ACTION-CONNECTION" in list "Select REST Action for Logic step 3"
    Then I see button "Edit data flow for Logic step 3" is enabled
    Then I don't see "collapse Input Variables" inside "Logic step 3 content"

  Scenario: Can edit selected action river input variables
    Given I will select an action river with inputs
    When I click button "Add Logic Step"
    When I select item "Action" in list "block-type-Logic-step-3"
    Then I see "Select REST Action" inside "Logic step 3 content"
    Then I see button "Edit data flow for Logic step 3" is disabled
    When I select item "MS-ACTION-INPUT ALL" in list "Select REST Action for Logic step 3"
    And I wait for action river data
    Then I don't see "collapse Input Variables" inside "Logic step 3 content"
    Then I see button "Edit data flow for Logic step 3" is enabled
    Then I click "collapse Input Variables" inside "Logic step 3 content"
    Then I see text "{INPUT_VARIABLE_1}"
    Then I see placeholder "1"
    Then I see text "{ANOTHER_VAR_2}"
    Then I see placeholder "222"
    Then I see button "edit start_date value"
    Then I don't see button "edit end_date value"

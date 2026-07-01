Feature: River Variables Editor - Actions for River
  As a data analyist, I want to to edit and save the variables of the currently viewed river, so I can map between source to target

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading

  Scenario: Edit variables
    When I click button "variables"
    Then I see text "4 variables"
    Then I see text "{oren}"
    And I see input "edit kids value" with value '["vv","bb","cc"]'
    Then I see button "delete variable oren"
    Then I see text "{kids}"
    Then I click force button "add variable"
    Then I see button "Add" is disabled

    When I type "kids" to "Variable Name"
    Then I see text "Variable exists already"
    Given I clear "Variable Name"
    Then I see text "required"
    Then I wait 100
    When I type "first_var" to "Variable Name"
    Then I wait 100
    Then I see button "Add" is enabled
    When I click button "Add"
    Then I see text "5 variables"
    When I type "s" to "search"
    Then I wait 400
    Then I see text "2 - 2 of 5 variables"
    When I clear "search"
    Then I wait 400
    Then I see text "5 variables"
    And I click button "Apply Changes"
    And I click button "variables"
    Then I see text "first_var"

    When I check "toggle first_var is_encrypted"
    And I click button "Apply Changes"
    Then I see text "Error"
    Then I wait 500
    Then I type "bla" inside "edit first_var value"
    And I click button "Apply Changes"
    # TODO - this is flaky - the toast persist for few seconds
    # Then I don't see text "Error"


    When I click button "variables"
    Then I see text "Data Flow Variables can only be used"
    And I uncheck "toggle first_var is_encrypted"
    Then I see checkbox "toggle first_var clear_value_on_start" is unchecked
    And I see checkbox "toggle kids clear_value_on_start" is checked
    When I uncheck "toggle first_var clear_value_on_start"
    Then I see checkbox "toggle first_var clear_value_on_start" is unchecked

    Then I see button "delete variable first_var"
    When I click button "delete variable first_var"
    Then I don't see button "delete variable first_var"
    Then I see text "4 variables"

  Scenario: Disable add actions for viewer role
    Given I sign in with a viewer account
    When I reload the page
    And I wait for river mocks to complete loading
    Then I see texts "Simple River Logic Example"
    Then I see button "variables" is visible
    When I click button "variables"
    When I wait 1000
    Then I see text "Data Flow Variables can only be used"
    And I see text "{oren}" is visible
    And I see button "delete variable oren" is disabled
    And I see button "add variable" is disabled
    And I see input "edit kids value" is disabled


Feature: Logic - Containers
  As a user, I want to be able to sort, delete and move steps,
  and I want to set a condition step so I could execute steps on specific cases and Loop over them

  Background:
    When logic river page is displayed

  Scenario: Condition as a Container
    Given I want to save a river
    When I click label "Logic step 1 add container"
    And I click menu button "Condition"
    Then I see text "If the"
    When I select option "Fail Data Flow" of "Condition Then"
    Then I see button "edit text Condition #1"
    Then I don't see text "Logic step 1"
    When I click button "Add Logic Step to Container 2"
    Then I see text "Condition #2"
    Then I see text "Else"
    When I click button "Save"
    And I click button "Save Anyway"
    Then I see step in index '0.0.1' has been saved with 'condition'

  Scenario: Loop as a Container
    When I wait 50
    When I click "Loop" menu item in "Logic step 1 add container" menu
    Then I see label "For each value in"
    When I type "var1{enter}" in select "For each value in"
    Then I see text "{var1}"
    When I click button "variables"
    Then I see texts "{var1}"

  Scenario: Max nesting level
    When I click "Run Once" menu item in "Logic step 1 add container" menu
    Then I don't see label "Logic step 1 add container"

  Scenario: Parallel steps
    Then I see switch 'Parallel Steps Container 1' is off
    When I switch 'Parallel Steps Container 1'
    Then I see switch 'Parallel Steps Container 1' is on

  Scenario: Delete Container from actions menu
    When I click "Run Once" menu item in "Logic step 1 add container" menu
    When I click "Delete Step" menu item in "step Container 1 actions" menu
    Then I don't see label "Logic step 1 add container"

  Scenario: Delete Step from actions menu
    When I click "Run Once" menu item in "Logic step 1 add container" menu
    When I click "Delete Step" menu item in "step Container 1 actions" menu
    Then I don't see label "Logic step 1 add container"

  Scenario: Ignore Errors from actions menu
    When I click "Ignore Errors" menu item in "step Container 1 actions" menu
    When I scroll Logic Steps to top
    Then I see Disabled Errors Icon in "Container 1"

  Scenario: Max nesting level complex inside
    When I click "Run Once" menu item in "Logic step 1 add container" menu
    When I click "Run Once" menu item in "Logic step 2 add container" menu
    Then I don't see label "Logic step 1 add container"
    Then I don't see label "step 2 add container"

  Scenario: Max nesting level complex outside
    When I click "Run Once" menu item in "Logic step 1 add container" menu
    When I click label "Add Logic Step to Container 2"
    When I click "Run Once" menu item in "Logic step 2 add container" menu
    Then I don't see label "Logic step 1 add container"
    Then I don't see label "Logic step 2 add container"

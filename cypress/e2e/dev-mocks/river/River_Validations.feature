Feature: River Validations
  As a data analyst
  I want to be notified when there are errors in my river's steps
  So I could fix it and save a valid river

  Background:
    When logic river page is displayed

  Scenario: Display errors for every step
    When I click Save
    Then I see the invalid message
    When I click "Cancel"
    Then I see "Please make sure this container is valid"

  Scenario: Validating condition with failed river option should not show errors
    When I click button "Add Logic Step"
    When I click "Condition" menu item in "Logic step 3 add container" menu
    And I select option "Fail Data Flow" of "Condition Then Condition #1"
    And I click Save
    Then I see the invalid message

  Scenario: Validating condition with failed river option should not show errors
    When I click "Condition" menu item in "Logic step 2 add container" menu
    Then I select option "Fail Data Flow" of "Condition Then Condition #1"

  Scenario: Display errors in required form fields
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"
    When I click Save
    Then I see text "Please make sure this container is valid"
    Then I see the invalid message
    And I see text "must NOT have fewer than 1 character"

  Scenario: Display errors for container steps
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"
    When I click Save
    Then I see the invalid message
    Then I see text "Something is not right"
    When I click button "Cancel"
    When I click "Run Once" menu item in "Logic step 2 add container" menu
    Then I see texts "Please make sure this step is valid" 2 times
    When I click Save
    Then I see the invalid message
    When I click Save Anyway
    Then I don't see text "Please make sure this step is valid"
    And I don't see text "Please make sure steps are valid"

  Scenario: Does not display error above a container with valid steps
    Given I want to set a connection as a source
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"
    When I select Target Type "Variable" of "Logic step 1"
    When I click Source of "Logic step 1"
    When I click "Delete Step" menu item in "step Logic step 2 actions" menu
    And I click button "Add Logic Step"
    When I click Save
    Then I see the invalid message
  # Then I see texts "Please make sure this step is valid" 1 times

  Scenario: Display custom error messages for Connection Bar
    Given I want to set a connection as a source
    When I select Step Type "SQL / DB Transformations" of "Logic-step-2"
    When I click Source of "Logic step 2"
    And I click Save
    Then I see text "must have required property \"Connection\""
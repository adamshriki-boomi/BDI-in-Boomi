Feature: River Actions
  As a data analyst
  I want to perform edit actions on a river
  So I could define a river

  Background:
    When logic river page is displayed

  Scenario: Add Logic Step of SQL To River
    When I click button "Add Logic Step"
    Then I see step content "Logic step 2"
    And I see text "SQL / DB Transformations"

  Scenario: Add Logic Step of Action To River
    Given I want to set a connection for Action step
    Given I want to save a river
    When I select Step Type "Action" of "Logic-step-2"
    When I click button "Add Logic Step"
    Then I see step content "Logic step 3"
    And I see texts "Select Rest Action" 2 times
    And I don't see label "select connection"
    When I select "City of Destruction" in Select action river of "Logic step 3"
    When I select "Back to the City" in Select action river of "Logic step 2"
    When I click Save
    # this verifies the action steps are valid
    Then the river save request is successful

  Scenario: Clear selected connection from action
    Given I want to set a connection for Action step
    When I select Step Type "Action" of "Logic-step-2"
    And I select "Back to the City" in Select action river of "Logic step 2"
    And I type "crimson" in Connection Name of "Logic step 2"
    And I see text "crimson"
    And I click clear in Connection Name of "Logic step 2"
    Then I don't see text "crimson"

  Scenario: Add Logic Step of River To River
    Given I select source to target river in logic step with variables
    When I select Step Type "Data Flow" of "Logic-step-2"
    Then I don't see "collapse Input Variables" inside "Logic step 2 content"
    When I select item "Source To Target Example" in list "Select data flow for Logic step 2"
    Then I click "collapse Input Variables" inside "Logic step 2 content"

    And I see text "var-1"
    And I don't see text "var-2"
    Then I see placeholder "vv,bb,cc"
    Then I see input with value "20220505"

    When I type "Simple River" in select "Select data flow for Logic step 2"
    Then I don't see "Simple River Logic Example" inside "Select data flow for Logic step 2 options list"

    When I click button "Add Logic Step"
    Then I see step content "Logic step 2"
    And I see few "Select data flow" inside "Logic step 2 content"

  Scenario: Add Logic Step of Python To River
    When I select Step Type "Python" of "Logic-step-2"
    And I click button "Add Logic Step"
    Then I see step content "Logic step 2"
    And I see "Python" inside "Logic step 2 content"

  Scenario: Edit River Description
    When I click "Edit Description" menu item in "river Simple River Logic Example actions" menu
    Then I see label "Describe this data flow"
    And I see text "This is the description"
    When I clear "Describe this data flow"
    And I type "this is a new description" to "Describe this data flow"
    And I click button "Save"
    When I click "Edit Description" menu item in "river Simple River Logic Example actions" menu
    Then I see text "this is a new description"

  Scenario: Add logic step to an empty river
    When I click "Delete Step" menu item in "step Container 1 actions" menu
    Then I see text "Nothing to see here"
    And I see text "Start your logic flow by adding your first logic step"
    When I click button "Add Logic Step"
    Then I see text "Logic Step 0"

  Scenario: Disable edit actions for blocked account
    Given I sign in with a blocked account
    When I reload the page
    Then I click button "close"
    Then I see texts "Simple River Logic Example" 2 times
    And I see button "Run" is disabled
    And I see button "Save" is disabled
    Then I navigate to rivers table
    Then I click button "Yes, leave data flow"
    And I see button "New Data Flow" is disabled
    And I see disabled sidebar item "Create"

  # Then I reload the page
  Scenario: Disable edit actions for viewer role
    Given I sign in with a viewer account
    When I reload the page
    Then I see texts "Simple River Logic Example" 2 times
    And I see button "Run" is disabled
    And I see button "Save" is disabled
    Then I see button "Edit" is disabled
    Then I see button "New Connection" is disabled

  Scenario: Collapse step with double click
    When I double click on Step Title "Logic step 1"
    Then I don't see text "Source"
    Then I don't see text "Target"
    Then I don't see label "Logic step 1 add container"
    Then I don't see text "block-type-Logic-step-1"
    Then I don't see text "data-target-type-Logic-Step"
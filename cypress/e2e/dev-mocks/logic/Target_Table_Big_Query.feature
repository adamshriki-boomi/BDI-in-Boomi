Feature: Target Table Big Query
  As a data analyst
  I want to set a big query as a target
  So I can run my bq through in a river

  Background:
    When logic river page is displayed
    When I click button "collapse Target Logic step 1"
    And I select option "Table" of "Target Type Logic step 1"

  Scenario: Displays more controls according to selections
    Then I see text "Load Into"

  Scenario: Show relevant controls according to Loading Mode
    Given I see text "Warning!"
    And I switch "Filter Logical key duplication between files."
    When I select item "Overwrite" in list "Loading Mode"
    Then I don't see text "Warning!"

  Scenario: Toggling target collapse and verify form values persist
    When I select item "Upsert - Merge" in list "Loading Mode"
    Then I see text "Warning!"
    And I switch "Filter Logical key duplication between files."
    When I select item "Overwrite" in list "Loading Mode"
    When I wait 100
    Then I don't see text "Warning!"
    When I click button "collapse Target Logic step 1"
    When I wait 100
    Then I don't see text "Warning!"
    When I click button "collapse Target Logic step 1"
    When I wait 100
    Then I don't see text "Warning!"

  Scenario: Show relevant controls according to Split Tables
    When I select item "By Insert Timestamp" in list "Split Tables"
    Then I see text "Split By Interval"
    When I select item "By Expression" in list "Split Tables"
    Then I see text "Fields Expression to split by"
    And I switch "Drop table after data flow ends"

  Scenario: Verify Data I set in step's forms is saved
    Given I want to verify step data is saved properly
    When I click "Delete Step" menu item in "step Container 1 actions" menu
    When I click button "Add Logic Step"
    And I click Source of "Logic step 0"
    And I click Advanced Options of "Logic step 0"
    And I click Target of "Logic step 0"
    When I type "RiseUp" to "Table Name"
    When I select item "Upsert - Merge" in list "Loading Mode"
    When I switch "Drop table after data flow ends"
    When I click Save
    When I click Save Anyway
    Then I see data I added has been saved properly

  Scenario: Disabled Container should not allow interaction with steps
    When I uncheck "enable Container 1"
    Then I see Container "Container 1" is Disabled

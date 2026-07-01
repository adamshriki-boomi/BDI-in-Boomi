Feature: Logic - Target Type: Table Snowflake
  The user is able to edit and set "table" option
  in a "Target". Some controls are shown and hidden based on selection of others.

  Background:
    When logic river page is displayed
    When I select item "Snowflake" in list "data-target-type-Logic-step-1"
    When I click button "collapse Target Logic step 1"
    And I select option "Table" of "Target Type Logic step 1"

  Scenario: Displays more controls for Snowflake according to selections
    Then I see label "content.database"
    And I see label "content.schema_id"

  Scenario: Add River Variable to Snowflake
    Given I want to save Simple River
    When I select Target Type "Variable" of "Logic step 1"
    When I select "var-2" in Variable Name
    When I click Save
    When I click Save Anyway
    Then I see "var-2" has been saved properly for step index "0.0"

  Scenario: Add Environment Variable to Snowflake
    Given I want to save Simple River
    Given I want to create an environment variable
    When I select Target Type "Variable" of "Logic step 1"
    When I select variable "Environment Variable"
    When I add variable "glass_bead" to Variable Name of "Logic step 1"
    Then I see environment variable "glass_bead" has been saved

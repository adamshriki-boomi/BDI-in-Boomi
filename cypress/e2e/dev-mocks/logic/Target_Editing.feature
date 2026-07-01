Feature: Table Editing
  As a data analyst
  I want to edit Table form fields
  So I can run a river with Target Table

  Background:
    And I want to set a connection as a source
    When logic river page is displayed

  Scenario: Edit random fields and assure persistence when switching targets
    When I click Target of "Logic step 1"
    And I select Target Type "Table" of "Logic step 1"
    When I type "jazz albums" to "Table Name"
    And I select Target Type "Variable" of "Logic step 1"
    And I select Target Type "Table" of "Logic step 1"
    Then I see input with value "jazz albums"
    When I select target "Amazon Redshift" of "Logic-step-1"
    Then I see input with value "jazz albums"
    When I select target "Snowflake" of "Logic-step-1"
    Then I see input with value "jazz albums"
    When I select target "Azure Synapse Analytics" of "Logic-step-1"
    Then I see input with value "jazz albums"
    When I select target "Amazon RDS/Aurora for PostgreSQL" of "Logic-step-1"
    Then I see input with value "jazz albums"


  Scenario: Edit fields in Target & Source and assure data persisting
    When I click Target of "Logic step 1"
    And I select Target Type "Table" of "Logic step 1"
    And I type "jazz albums" to "Table Name"
    When I click Source of "Logic step 1"
    Then I see input with value "jazz albums"
    When I select connection "SwoopBong"
    Then I see input with value "jazz albums"
    When I select Target Type "Variable" of "Logic step 1"
    And I select Target Type "Table" of "Logic step 1"
    Then I see input with value "jazz albums"
    And I see text "SwoopBong"

    When I select target "Databricks" of "Logic-step-1"
    When I toggle switch with label "Store in a custom location"
    And I select option "DBFS" of "content.location_type"
    Then I see text "External Path"
    When I select option "External Location" of "content.location_type"
    Then I see text "External Table Location Path"
    And I see text "You may use an external location prefix for creating a Delta table under external location."

  Scenario: Updating an input in the middle of an existing value in Target
    When I click Target of "Logic step 1"
    And I select Target Type "Table" of "Logic step 1"
    And I type "jazz albums" to "Table Name"
    And I type "{movetostart}fusion " to "Table Name"
    Then I see input with value "fusion jazz albums"
    When I type "punk " to "Table Name"
    Then I see input with value "fusion punk jazz albums"

  Scenario: Auto select newly added variable and be able to remove it
    When I click Target of "Logic step 1"
    And I type "varVar{enter}" inside 'Variable Name'
    And I see text "varVar"
    And I clear variable name in "Logic step 1"
    And I don't see text "varVar"

  Scenario: Get error of newly added variable when it includes invalid chars
    When I click Target of "Logic step 1"
    And I type "New variable {enter}" inside 'Variable Name'
    Then I see text "Variable name must contain only letters, digits or underscores"

  Scenario: Add new dataframe inline
    Given I want to add new dataframe to the list
    And I add new dataframe
    When I select target "Snowflake" of "Logic-step-1"
    And I click Target of "Logic step 1"
    And I click label "Target Type DataFrame"
    Then I see text "By default, the DataFrame location will be set to a PUBLIC Schema"
    And I see label "content.database"
    And I see label "content.schema_id"
    When I type "my-new-dataframe {enter}" in select "DataFrame"
    Then I see the new data frame has been added
    Then I select "my-new-dataframe" in DataFrame
    And I click outside to let the input render the value
    And I see text my-new-dataframe

  Scenario: See selected dataframe by name
    And I click Target of "Logic step 1"
    And I click label "Target Type DataFrame"
    And I see text "dataframe_1"

  Scenario: Snowflake masking policy
    When I select target "Snowflake" of "Logic-step-1"
    And I click Target of "Logic step 1"
    When I see text "Enforce Masking Policy"
    And I switch "Enforce Masking Policy"
    Then I see text "To enforce masking policy, please make sure you have"
    When I click "Cancel"
    Then I see switch "Enforce Masking Policy" is off
    When I switch "Enforce Masking Policy"
    Then I see text "To enforce masking policy, please make sure you have"
    When I click "Apply"
    And I see switch "Enforce Masking Policy" is on

  Scenario: Dataframe as a source should not include a mapping button
    When I select target "Snowflake" of "Logic-step-1"
    And I click Target of "Logic step 1"
    And I select item "Upsert - Merge" in list "Loading Mode"
    And I scroll Logic Steps to bottom
    And I click Source of "Logic step 1"
    When I select option "DataFrame" of "Source Type Logic step 1"
    Then I don't see text "Columns Mapping"
    And I don't see text "Merge"

  Scenario: SQL Script is been selected
    Given I want to save Simple River
    Given I want to verify step data is saved properly
    Given I want to select a custom file zone
    When I select target "Snowflake" of "Logic-step-1"
    And I click Target of "Logic step 1"
    And I select Target Type "Files Export" of "Logic step 1"
    When I select item "s3 testing1" in list "FileZone Connection"
    And I click Source of "Logic step 1"
    When I select option "SQL Script" of "Source Type Logic step 1"
    When I click Save
    When I click Save Anyway
    Then river is saved without fzConnection
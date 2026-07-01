Feature: Modify River Columns Mapping
  As a user, I want to be able to modify the columns mapping of a step.

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading

  Scenario: Open empty columns mapping
    When I select Step Type "SQL / DB Transformations" of "Logic-step-2"
    When I select item "Snowflake" in list "data-target-type-Logic-step-2"
    Then I don't see label "Target Type Logic step 2"
    When I click button "collapse Target Logic step 2"
    Then I see label "Target Type Logic step 2"
    # Then I don't see "Columns Mapping" inside "Logic step 2 content"
    When I select option "Table" of "Target Type Logic step 2"
    Then I see "Columns Mapping" inside "Logic step 2 content"
    When I click "Columns Mapping" inside "Logic step 2 content"
    Then I see "0 Columns" inside "columns mapping modal"
    When I click button "add field"
    Then I see input with value "newField"
    Then I see placeholder "newField"
    When I clear type "my_var" to "edit 0 fieldName"
    Then I see placeholder "newField"
    When I blur active input
    Then I don't see placeholder "newField"
    Then I see placeholder "my_var"

  Scenario: Exit without save does not change draft
    When I select Step Type "SQL / DB Transformations" of "Logic-step-2"
    When I select item "Snowflake" in list "data-target-type-Logic-step-1"
    When I click button "collapse Target Logic step 1"
    When I select option "Table" of "Target Type Logic step 1"
    When I click "Columns Mapping" inside "Logic step 1 content"
    When I click button "add field"
    When I check "set 5 as cluster key"
    # When I spy action "river/updateStepContent"
    When I click button "add field"
    # Then I saw action "river/updateStepContent" 0 times
    When I click "Cancel" inside "columns mapping modal"
    # Then I saw action "river/updateStepContent" 0 times
    When I click "Columns Mapping" inside "Logic step 1 content"
    Then I see checkbox "set 5 as cluster key" is unchecked

  Scenario: Open columns mapper and update: existing mapping
    # setup the target
    When I select item "Snowflake" in list "data-target-type-Logic-step-1"
    Then I don't see label "Target Type Logic step 1"
    When I click button "collapse Target Logic step 1"
    Then I see label "Target Type Logic step 1"
    When I select option "Table" of "Target Type Logic step 1"
    Then I see "Columns Mapping" inside "Logic step 1 content"
    When I click "Columns Mapping" inside "Logic step 1 content"

    # When I spy action "river/updateStepContent"

    # verify init state
    Then I see button "expand 1"
    Then I don't see button "expand 1.1"
    Then I see button "insert mapping to 0"
    Then I see button "insert mapping before 0"

    Then I see button "expand 1"
    When I click button "expand 1"
    Then I don't see button "expand 1"
    Then I see button "collapse 1"
    Then I see button "expand 1.0"
    Then I don't see button "expand 1.1"

    Then I see button "expand 0"
    When I click button "expand 0"
    Then I don't see button "expand 0"
    Then I don't see button "insert mapping to 0.0"
    Then I don't see button "insert mapping to 0.1"

    Then I don't see button "expand 0.0"
    When I select item "RECORD" in list "choose type 0.0"
    Then I see button "insert mapping to 0.0"
    Then I don't see button "expand 0.0"
    When I click button "insert mapping to 0.0"
    Then I see button "expand 0.0"
    Then I don't see button "insert mapping to 0.1"
    When I select item "RECORD" in list "choose type 0.1"
    Then I see button "insert mapping to 0.0"
    Then I see button "insert mapping to 0.1"

    Then I see button "collapse 0"
    When I click button "collapse 0"
    Then I don't see button "collapse 0"
    Then I see button "expand 0"

    When I click button "insert mapping before 0"
    Then I don't see button "collapse 0"
    Then I don't see button "expand 0"

    Then I see input "edit 0 fieldName" with value "newField"
    When I clear type "test_field" to "edit 0 fieldName"
    When I blur active input
    Then I see input "edit 0 fieldName" with value "test_field"
    Then I see input "edit 0 alias" with placeholder "test_field"
    Then I see input "edit 0 alias" without value "test_field"

    # Then I don't see label "clear 1 as cluster key"
    Then I see checkbox "set 1 as cluster key" is unchecked
    When I check "set 1 as cluster key"
    Then I don't see label "set 1 as cluster key"
    Then I see label "clear 1 as cluster key"
    When I check "set 5 as cluster key"
    When I check "set 3 as cluster key"
    Then I see checkbox "clear 5 as cluster key" is checked

    When I select item "REPEATED" in list "choose mode 5"
    When I hover button "tooltip icon repeated"
    # When I wait 1000
    # TODO flaky
    # Then I see "field will be uploaded"
    # Then I saw action "river/updateStepContent" 0 times
    When I click "save" inside "columns mapping modal"
    # Then I saw action "river/updateStepContent" 1 times

    When I click "Columns Mapping" inside "Logic step 1 content"
    Then I see checkbox "clear 5 as cluster key" is checked
    Then I see checkbox "clear 3 as cluster key" is checked
    Then I see checkbox "clear 1 as cluster key" is checked

  Scenario: Use automapping
    Given I will select a river with auto mapping
    When I select Step Type "SQL / DB Transformations" of "Logic-step-1"
    When I select item "Snowflake" in list "data-target-type-Logic-step-1"
    When I click button "collapse Target Logic step 1"
    When I select option "Table" of "Target Type Logic step 1"
    When I click "Columns Mapping" inside "Logic step 1 content"
    Then I see "24 Columns" inside "columns mapping modal"
    When I click button "add field"
    Then I see "25 Columns" inside "columns mapping modal"
    Then I don't see placeholder "from_currency"
    When I click "Columns Mapping" inside "columns mapping modal"
    When I wait for mapping data
    Then I see text "NUMBER"
    When I click button "goto last page"
    Then I see "34 Columns" inside "columns mapping modal"
    Then I see placeholder "from_currency"
    When I click button "Cancel"
    And I click "Columns Mapping" inside "Logic step 1 content"
    Then I see "24 Columns" inside "columns mapping modal"
    Then I don't see placeholder "from_currency"
    When I click "Columns Mapping" inside "columns mapping modal"
    When I wait for mapping data
    When I click button "goto last page"
    Then I see placeholder "from_currency"
    Then I see "33 Columns" inside "columns mapping modal"
    When I click button "Clear All Mappings"
    Then I see "0 Columns" inside "columns mapping modal"

  Scenario: Use empty automapping
    Given I will select a river without auto mapping
    When I select Step Type "SQL / DB Transformations" of "Logic-step-1"
    When I select target "Snowflake" of "Logic-step-1"
    When I click Target of "Logic step 1"
    When I select option "Table" of "Target Type Logic step 1"
    When I click "Columns Mapping" inside "Logic step 1 content"
    Then I see "24 Columns" inside "columns mapping modal"
    When I click button "add field"
    Then I see "25 Columns" inside "columns mapping modal"
    Then I don't see placeholder "from_currency"
    When I click "Columns Mapping" inside "columns mapping modal"
    When I wait for mapping data
    Then I see "25 Columns" inside "columns mapping modal"
    Then I see alert with 'mapping error for step'

  Scenario: Add variables and save river
    Given I will select a river with auto mapping
    When I select Step Type "SQL / DB Transformations" of "Logic-step-1"
    When I select target "Google BigQuery" of "Logic-step-1"
    When I click Source of "Logic step 1"
    And I click Advanced Options of "Logic step 1"
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"
    Then I see text "No Partition"
    And I don't see text "Partition Granularity"
    When I click button "Columns Mapping"
    And I click button "Save"
    Then I see item "TIMESTAMP" selected in list "Partition Type"
    Then I see item "DAY" selected in list "Partition Granularity"
    Given I want to set variables in column mapper
    When I click button "Save"
    And I click button "Save Anyway"
    Then river is saved with selected partitions

  Scenario: Add bucket to Athena mapping
    Given I will select a river with auto mapping
    When I select Step Type "SQL / DB Transformations" of "Logic-step-1"
    When I select target "Amazon Athena" of "Logic-step-1"
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"
    Then I don't see text "Number Of Buckets"
    Then I see text "No Partition"
    When I click button "Columns Mapping"
    And I check "check 0 bucket"
    And I click button "Save"
    Then I see text "Number Of Buckets" is visible
    Then I don't see text "No Partition"
    Then I see input "Number Of Buckets" with value "2"
    Then I type "3" to "Number Of Buckets"
    Given I want to set variables in column mapper
    When I click button "Save"
    And I click button "Save Anyway"
    Then river is saved with selected bucket and partition

  Scenario: Check number input inside columns mapping
    Given I will select a river with auto mapping
    When I select Step Type "SQL / DB Transformations" of "Logic-step-1"
    When I select target "Amazon Redshift" of "Logic-step-1"
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"
    When I click button "Columns Mapping"
    Then I type "256" to label "edit 1 length"
    And I see input with value "256"

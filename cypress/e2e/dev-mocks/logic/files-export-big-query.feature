Feature: Logic - Target Type: Files Export Big Query
  The user is able to edit and set "files export" option
  in a "Target". Some controls are shown and hidden based on selection of others

  Background:
    When logic river page is displayed
    When I click button "collapse Target Logic step 1"
    And I select Target Type "Files Export" of "Logic step 1"

  Scenario: Displays more controls according to selections
    Then I see texts "Dataset Id"
    Then I see texts "Bucket Name"
    Then I see select "Bucket Name" with "Division Bell"
    Then I see texts "File Name and File Path Destination"

  Scenario: Show relevant controls according to CSV
    When I select option "CSV" of "File Type"
    Then I see texts "Include Header"
    Then I see texts "Field Delimiter"
    Then I see texts "Quote Char"
    Then I see texts "Compression"

  Scenario: Show relevant controls according to JSON
    When I select option "JSON" of "File Type"
    Then I see label "Compression Logic step 1"
    Then I don't see text "Field Delimiter"
    Then I don't see text "Quote Char"
    Then I don't see text "Include Header"

  Scenario: Show relevant controls according to AVRO
    When I select option "AVRO" of "File Type"
    Then I don't see text "Field Delimiter"
    Then I don't see text "Quote Char"
    Then I don't see text "Include Header"
    Then I don't see text "Compression"

  Scenario: Mark checkbox in Target's Files Export of should be Unique for each step
    When I select Step Type "SQL / DB Transformations" of "Logic-step-2"
    And I select item "Google BigQuery" in list "data-target-type-Logic-step-2"
    And I click button "collapse Target Logic step 2"
    And I select Target Type "Files Export" of "Logic step 2"
    When I uncheck "Load into a single file Logic step 1"
    And I switch "Load into a single file Logic step 2"
    Then I see switch "Load into a single file Logic step 1" is off
    Then I see switch "Load into a single file Logic step 2" is on

  Scenario: Show Connections Bar for snowflake block type + file export + when moving between steps types the target type returns to table
    Given I want to create a new s3 connection
    When I select item "Snowflake" in list "data-target-type-Logic-step-1"
    Then I see label "Connection Name"
    When I select Target Type "Files Export" of "Logic step 1"
    Then I see label "Connection Name"
    And I see label "FileZone Connection"
    When I click on new connection For S3
    When Data Sources have loaded
    Then I see text "Amazon S3 Connection"
#    When I want to save a new connection
#    When I type "s3 conn" to "Connection Name"
#    And I click button "Save"
#    Then the new connection is saved successfully
#    And connections list is reloaded
#    Then I don't see text "Amazon S3 Connection"
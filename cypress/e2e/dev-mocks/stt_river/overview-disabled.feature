Feature: Source To Target Data Flow - Overview Tab
  Background:
    And I want to suppress errors
    Given I want to see rivers of all types
    When I click sidebar "Data Flows"
    Given I want to view disabled source to target flow
    Given I want to see schemas
    And I want to set MySql as a connection
    And I want to set Snowflake as a connection
    Then I see "s2t demo"
    When I navigate to Stt data flow

  Scenario: display summary details
    Then I see texts "s2t demo"
    Then I see tab 'Summary' is selected
    Then I see "rivery_demo"
    Then I see "Rivery Snowflake"
    Then I see "No schedule was set"
    Then I see "Last Modified"
    Then I see texts "John Doe"
    Then I see buttons 'Activate, Save Changes'
    And I see link "Close"
    And I see switch "Activate Data Flow" is off

  Scenario: changing connection clears data settings values
    When I see texts "s2t demo"
    Given I want to set DB and schema
    Then I select tab "Target"
    Given all target fields were loaded
    Then I wait 500
    Then I see item "Rivery Snowflake" selected in list "connections"
    Then I see default value "rivery_demo" selected in list "database_name"
    Then I wait 1000
    Then I select item 'test' in list 'connections'
    Then I don"t see default value "rivery_demo" selected in list "database_name"

  Scenario: configure data source settings
    When I see texts "s2t demo"
    Then I select tab "Source"
    Then I see tab "Source" is selected
    And I see 'Selected Data Source'
    And I see 'Source Connection'
    And I see 'Please enter the necessary credentials to establish a connection with your Data Source.'
    Then I wait 1000
    And I see list "connections" has selection
    Then I select item 'test-timeout' in list 'connections'
    Then I see button "Change Connection"
    And I click button "Change Connection"
  # Then I see "Performing a test Connection is recommended to ensure a valid Connection for a successful Data Flow."

  Scenario: configure data target settings
    When I see texts "s2t demo"
    Then I select tab "Target"
    Then I see tab "Target" is selected
    Given all target fields were loaded
    And I see 'Selected Data Target'
    And I see 'Target Connection'
    And I see 'Please enter the necessary credentials to establish a connection with your Data Target.'
    And I see label 'Test Connection'
    Then I see item "Rivery Snowflake" selected in list "connections"
    Then I wait 1000
    Then I select item 'test' in list 'connections'
    Then I see "Performing a test Connection is recommended to ensure a valid Connection for a successful Data Flow."
    And I see "Data Loading Settings"
    # Then I see default value "rivery_demo" selected in list "database_name"
    # Then I see default value "public" selected in list "schema_name"
    And I see "Select and enter all the values for the chosen Target Destination."

  Scenario: validate leaving the page prompt
    When I see texts "s2t demo"
    Then I select tab "Schema"
    Then I click "Extraction Mode"
    Then I click "CDC (Change Data Capture)"
    Then I click button "Apply Changes"
    Then I select tab "Source"
    Then I see button "Activate" is disabled
    And I see button "Save Changes" is disabled
    When I click sidebar "Activities"
    Then I see text "Unsaved Changes" in dialog
    And I see button "Discard"
    And I see button "Save Changes"
    And I see button "Cancel"
    Then I click button "Cancel"
    Then I see in url "rivers"
    Then I click sidebar "Activities"
    And I see button "Discard"
    And I click button "Discard"
    Then I see in url "activities"

  Scenario: change extract method and activate
    When I see texts "s2t demo"
    Then I select tab "Schema"
    Then I click "Extraction Mode"
    Then I click "CDC (Change Data Capture)"
    Then I click button "Apply Changes"
    Then I see button "Activate" is disabled
    And I select tab "Summary"
    And I see text "Scheduling is required for CDC data flow"
    Then I click force button "Set Schedule"
    Then I see switch "Schedule Data Flow" is off
    Then I click "Schedule Data Flow"
    Then I see switch "Schedule Data Flow" is on
    Then I click button "Apply Changes"
    Then I see button "Activate" is enabled
    Given I want to modify s2t data flow
    Given I want to activate cdc
    Then I click button "Activate"
    Then I see text "Data Flow Activation"
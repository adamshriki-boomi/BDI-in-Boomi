Feature: New s2t river: postgres_to_snowflake
    I want to make sure all river types save functionality is up and running

    Background: Select the river
        When I sign in as real admin to the app
        # When I click label "environment account selector"
        # Then I click force text "Create river test"
        # When The selected environment has loaded
        Then I click sidebar 'Data Flows'


    Scenario: create new s2t river with postgres and snowflake
        Then I click button "New Data Flow"
        Then I click 'Source to Target Flow'
        Then I type 'postgres' to 'search'
        Then I click label "tooltip icon PostgreSQL"
        Then I click button "Next"
        Then I type 'snowflake' to 'search'
        Then I click label "tooltip icon Snowflake"
        Then I click button "Next"
        Then I click label "Standard Extraction"
        Then I click button "Nast_DB"
        Then I check "select table react_automation"
        Then I click label "react_automation target_table"
        Then I type '_test' to label "react_automation target_table"
        Then I click button "Tables Definitions"
        Then I click button "Advanced target Definitions"
        Then I type the current timestamp to 'Add a character/phrase to the beginning of the Target Table name.'
        Then I force switch "Filter Logical Key Duplication Between Files" in "target" definitions
        Then I click button "Apply Changes"
        Then I scroll to "Extract Method"
        And I select item "incremental" in list "select react_automation extract method"
        Then I select item "id" in list "select react_automation incremental field"
        Then I type "1" to "react_automation start_value"
        Then I type "10" to "react_automation end_value"
        Then I click button "react_automation"
        And I select tab "Source Settings"
        And I see label "Table Source Settings"
        Then I click 'Select...'
        Then I click 'Without Timezone'
        Then I type "12" to "Exporter Chunk Size" 'input'
        Then I type "id < 100" to "Filters" 'textarea'
        And I select tab "Target Settings"
        Then I click text 'Override Default Target Settings'
        Then I click text 'Enforce Masking Policy'
        Then I click button "Apply Changes"
        Given I want to save a River
        When I want save river name with prefix 'e2e-postgres-snowflake'
        When River was saved
        When I search and delete new s2t river



    @skip
    Scenario: activate change and run exist river
        Then I click 'Update Me Postgres Snowflake'
        Then I wait 1000
        When I save current total runs count
        Then I click text "Update Me Postgres Snowflake"
        Then I type " 2" inside "Name"
        Then I click button "Apply Changes"
        Then I select tab "Schema"
        Then I click button 'Nast_DB'
        Then I check 'select table react_automation'
        Then I click label "react_automation target_table"
        Then I type '_test' to label "react_automation target_table"
        Then I click button "Tables Definitions"
        Then I click button "Advanced target Definitions"
        Then I type the current timestamp to 'Add a character/phrase to the beginning of the Target Table name.'
        Then I click label "filter_logical_key"
        Then I click button "Apply Changes"
        Then I click button "react_automation"
        And I select tab "Source Settings"
        Then I click 'Select...'
        Then I click 'With Timezone'
        Then I type "id < 100" to "filter_expression"
        Then I type "12" to "exporter_chunk_size"
        And I select tab "Target Settings"
        Then I click label 'override_target_switch'
        Then I click label 'enforce_masking_policy'
        Then I click button "Apply Changes"
        Then I see switch "Activate Data Flow" is off
        Then I check "Activate Data Flow"
        When text "Data Flow Activation" is visible
        Then I see button "Cancel Activation"
        When button "Run Data Flow" is visible
        Then I see text "Data Flow Was Successfully Activated!"
        Then I see button "Run Data Flow"
        Then I click button "Run Data Flow"
        When text "Data Flow run completed successfully" is visible
        Then I wait 1000
        Then the total runs count should increase by 2
        Then I click sidebar "Data Flows"


    @skip
    Scenario: disable change and save exist river
        Then I click 'Update Me Postgres Snowflake 2'
        Then I wait 1000
        Then I see switch "Activate Data Flow" is on
        Then I uncheck "Activate Data Flow"
        Then I see texts "Disable Data Flow"
        Then I click button "Disable Data Flow"
        When text "Data Flow Disabling" is visible
        Then I see button "Close"
        Then I click button "Close"
        Then I click text "Update Me Postgres Snowflake 2"
        Then I remove ' 2' inside 'Name'
        Then I click button "Apply Changes"
        Then I select tab "Schema"
        Then I click button 'Nast_DB'
        Then I uncheck checkbox 'select table react_automation'
        Then I click button "Tables Definitions"
        Then I click button "Advanced target Definitions"
        Then I remove the current timestamp inside 'Add a character/phrase to the beginning of the Target Table name.'
        Then I click label "filter_logical_key"
        Then I click button "Apply Changes"
        Then I wait 5000
        Then I click "Close"
        Then I wait 5000
        Given I want to save a River
        Then I click button 'Save Changes'
        When River was saved
        Then I wait 10000
        Then I type 'Update Me Postgres Snowflake' to "search-Data Flows"
        Then I see "Update Me Postgres Snowflake"


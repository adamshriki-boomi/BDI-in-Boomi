Feature: New s2t river: mysql_to_bigquery
    I want to make sure all river types save functionality is up and running



    Background: Select the river
        When I click label "environment account selector"
        Then I click force text "Create river test"
        When The selected environment has loaded
        Then I click sidebar 'Data Flows'


    @skip
    Scenario: Create new standard river with all mysql bigquery specifics
        Then I click button "New Data Flow"
        Then I click 'Source to Target Flow'
        Then I type 'mysql' to 'search'
        Then I click label "tooltip icon MySQL"
        Then I click button "Next"
        Then I type 'bigquery' to 'search'
        Then I click label "tooltip icon Google BigQuery (Target)"
        Then I click button "Next"
        Then I click label "Standard Extraction"
        Then I click button "nast_db"
        Then I check "select table react_automation"
        Then I click label "react_automation target_table"
        Then I type '_test' to label "react_automation target_table"
        Then I click button "Tables Definitions"
        Then I click button "Advanced source Definitions"
        Then I force switch "Replace Invalid Characters" in "source" definitions
        Then I click button "Advanced target Definitions"
        Then I type the current timestamp to 'Add a character/phrase to the beginning of the Target Table name.'
        Then I click button "Apply Changes"
        Then I scroll to "Extract Method"
        And I select item "incremental" in list "select react_automation extract method"
        Then I select item "balance" in list "select react_automation incremental field"
        Then I type "1" to "react_automation start_value"
        Then I type "2000" to "react_automation end_value"
        Then I click button "react_automation"
        And I select tab "Source Settings"
        And I see label "Table Source Settings"
        Then I type "12" to "Exporter Chunk Size" 'input'
        Then I type "id < 100" to "Filters" 'textarea'
        And I select tab "Target Settings"
        Then I click text 'Override Default Target Settings'
        Then I see text "SQL Dialects"
        Then I see text 'Partition Type'
        # Then I scroll to 'Support Escape Character'
        # Then I select item 'shiran' in list 'escape-character'
        Then I click button "Apply Changes"
        Given I want to save a River
        When I want save river name with prefix 'e2e-mysql-bq'
        When River was saved
        When I search and delete new s2t river

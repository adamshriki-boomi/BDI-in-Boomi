Feature: New s2t river: mssql_to_databricks
    I want to make sure all river types save functionality is up and running

    Background: Select the river
        When I sign in as real admin to the app
        Then I click sidebar 'Data Flows'


    Scenario: Create new standard river with all mssql databricks specifics


        When I start new s2t river with 'sql server' as source and click label "tooltip icon Microsoft SQL Server"
        Then I click button "Next"
        When I select 'databricks' as a target and click label "tooltip icon Databricks SQL"
        Then I click button "Next"
        When I select extraction method, select 'dbo' and table and add incremental field
        Then I type "1" to "react_automation start_value"
        Then I type "2000" to "react_automation end_value"
        Then I click button "Tables Definitions"
        Then I click button "Advanced source Definitions"
        Then I force switch "Replace Invalid Characters for Target Tables / Columns Names" in "source" definitions
        Then I force switch "Ignore Hidden Columns" in "source" definitions
        Then I force switch "Hexadecimal string representation for VARBINARY values" in "source" definitions
        Then I force switch "Replace Newline Characters" in "source" definitions
        Then I click button "Advanced target Definitions"
        Then I type the current timestamp to 'Add a character/phrase to the beginning of the Target Table name.'
        Then I click button "Apply Changes"
        When I test filter and chunk size fields in Source settings
        And I select tab "Target Settings"
        Then I click text 'Override Default Target Settings'
        Then I click button "Apply Changes"
        Given I want to save a River
        When I want save river name with prefix 'e2e-mssql-databricks'
        When River was saved
        When I search and delete new s2t river

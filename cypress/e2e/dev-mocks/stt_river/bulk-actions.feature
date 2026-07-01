
Feature: Source To Target Data Flow - Overview Tab
    Background:
        And I want to suppress errors
        Given I want to see rivers of all types
        When I click sidebar "Data Flows"
        Given I want to view source to target flow
        Given I want to see schemas
        When I navigate to Stt data flow
        Then I select tab "Schema"

    Scenario: Bulk actions disabled with less than 2 tables selected
        Then I see 'crown'
        Then I click 'crown'
        And I see button "Bulk Actions" is disabled
        When I see label "select table NewTable2"
        Then I check "select table NewTable2"
        When I see label "select table NewTable test space"
        Then I check "select table NewTable test space"
        And I see button "Bulk Actions" is enabled

    Scenario: Bulk actions base standard flow
        Given I checked multiple tables and opened bulk menu
        Then I click "All tables"
        And I click "Next"
        Then I click text "Set to ‘All’"
        Then I click "Next"
        And I see text "Set to ‘All’"
        And I click "Apply Bulk Actions"

    Scenario: Bulk actions add calculated columns
        Given I checked multiple tables and opened bulk menu
        Then I click "All tables"
        And I click "Next"
        And I see button "Next" is disabled
        And I click "Add"
        Then I scroll to "Discard"
        And I write "test expression" to "Expression"
        And I write "bulk_test_column_name" to "Target Column Name"
        And I select item "STRING" in list "Data Type"
        Then I click button "Add Column"
        And I see button "Next" is enabled
        Then I click "Next"
        And I see text "bulk_test_column_name"
        And I click "Apply Bulk Actions"
        Then I click button "NewTable2"
        And I see text "bulk_test_column_name"

    Scenario: Bulk action with specific tables
        Given I checked multiple tables and opened bulk menu
        Then I see texts "crown"
        And I see text "Total Selected: 2"
        And I click label "arrow_schema_crown"
        And I uncheck "select_child_NewTable2"
        Then I see text "Total Selected: 1"
        And I click "Next"
        And I click text "Set Loading Mode"
        When I select item "Overwrite" in list "actions.loadingMethod"
        And I click "Next"
        And I see text "Specific tables"
        And I see text "Overwrite"
        Then I click button "Apply Bulk Actions"
        Then I scroll to "Loading Mode"
        Then I see texts "Overwrite" 1 times
        And I see texts "Upsert Merge" 1 times

    Scenario: Bulk actions with filters
        Given I checked multiple tables and opened bulk menu
        Then I click "Specific tables based on conditions"
        And I see text "Total matched: 0"
        Then I select item "Table Name" in list "filters.0.field"
        Then I select item "is" in list "filters.0.operator"
        Then I write "NewTable2" to "Value"
        And I click button "Apply Filters"
        Then I see text "Total matched: 1"
        Then I select item "prefix is" in list "filters.0.operator"
        Then I write "NewTable" to "Value"
        And I click button "Apply Filters"
        Then I see text "Total matched: 2"

    Scenario: Change default loading method in and out of bulk:
        Given I want to set DB and schema
        Then I see 'crown'
        Then I click 'crown'
        Then I click button "Tables Definitions"
        And I click button "Advanced target Definitions"
        Then I select item "Overwrite" in list "river.properties.target.loading_method"
        And I click button "Apply Changes"
        And I check 'select table NewTable2'
        Then I open table "NewTable2" and expect to see loading mode "Overwrite(Default)" is selected in list "table.additional_target_settings.target_loading"
        Then I check 'select table NewTable test space'
        And I click button "Bulk Actions"
        And I click text "Specific tables"
        And I click label "arrow_schema_crown"
        And I uncheck "select_child_NewTable2"
        And I click "Next"
        And I click text "Set Loading Mode"
        Then I select item "Upsert Merge" in list "actions.loadingMethod"
        And I select item "Merge" in list "actions.mergeMethod"
        And I click "Next"
        Then I click button "Apply Bulk Actions"
        Then I open table "NewTable2" and expect to see loading mode "Overwrite(Default)" is selected in list "table.additional_target_settings.target_loading"
        Then I open table "NewTable test space" and expect to see loading mode "Upsert Merge" is selected in list "table.additional_target_settings.target_loading"

Feature: Source To Target CDC Data Flow - Overview Tab
    Background:
        And I want to suppress errors
        Given I want to see rivers of all types
        When I click sidebar "Data Flows"
        Given I want to view source to target flow
        Given I want to see schemas
        And I want to set MySql as a connection
        And I want to set Snowflake as a connection
        Then I see "s2t demo"
        When I navigate to Stt data flow

    Scenario: Change source connection and see only the change connection modal
        When I see texts "s2t demo"
        Then I select tab "Source"
        Then I see text "rivery_demo"
        Given I want to set DB and schema
        Then I select item 'Rivery Employees' in list 'connections'
        Then I see button "Change Connection"
        Then I click button "Change Connection"
        Then I see item "Rivery Employees" selected in list "connections"
        And I don't see text "rivery_demo"

    Scenario: Change incremental field value in and out of table
        Given I want to edit table settings
        Then I select tab "Schema"
        Then I click 'crown'
        And I check 'select table or_test_epoch'
        Then I scroll to "Extract Method"
        And I select item "Incremental" in list "select or_test_epoch extract method"
        Then I select item "from_date" in list "select or_test_epoch incremental field"
        Then I scroll to "Start Value"
        And I click label "or_test_epoch timestamp"
        Then I select item "Yesterday" in list "Date Range"
        And I click button "Apply Changes"
        Then I click button "or_test_epoch"
        Then I select tab "Table Source Settings"
        And I click label "undefined timestamp"
        And I see value "Yesterday" is selected in list "Date Range"
        Then I select item "Week To Date" in list "Date Range"
        And I click button "Apply Changes" in place 0
        And I click button "Apply Changes"
        Then I wait 2000
        Then I scroll to "Start Value"
        And I click label "or_test_epoch timestamp"
        And I see value "Week To Date" is selected in list "Date Range"

    Scenario: Start date have valid default
        Then I select tab "Schema"
        Then I click 'crown'
        And I check 'select table or_test_epoch'
        Then I click button "or_test_epoch"
        Then I select tab "Table Source Settings"
        And I select option "Incremental" of "extraction method"
        Then I select item "from_date" in list "Incremental Field"
        And I click label "undefined timestamp"
        Then I see value "Date Range" is selected in list "Date Range"

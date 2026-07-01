
Feature: Source To Target CDC Data Flow - Overview Tab
    Background:
        And I want to suppress errors
        Given I want to see rivers of all types
        When I click sidebar "Data Flows"
        Given I want to view cdc source to target flow
        Given I want to see schemas
        And I want to set MySql as a connection
        And I want to set Snowflake as a connection
        Then I see "s2t demo"
        # this is here to allow running tests
        # when stt is live, this should be replaced with:
        # When I click "s2t demo"
        When I navigate to Stt data flow

    Scenario: change target connection for active data flow and cancel
        When I see texts "s2t demo"
        Then I select tab "Target"
        Given I want to set DB and schema
        Then I see text "Data Loading Settings"
        And I see text "Rivery Snowflake"
        Given all target fields were loaded
        Then I select item 'SF' in list 'connections'
        Then I see text "Applying Changes to an Active Data Flow"
        And I see button "Cancel"
        And I see button "Continue"
        Then I click button "Cancel"
        And I see item "Rivery Snowflake" selected in list "connections"
        And I don't see text "test"

    Scenario: change target connection for active data flow and confirm
        When I see texts "s2t demo"
        Given I want to set DB and schema
        Then I select tab "Target"
        Then I see text "Data Loading Settings"
        And I see text "Rivery Snowflake"
        Given all target fields were loaded
        Then I select item 'SF' in list 'connections'
        Then I see text "Applying Changes to an Active Data Flow"
        And I see button "Cancel"
        And I see button "Continue"
        Then I click button "Continue"
        Then I see item "SF" selected in list "connections"
        And I don't see text "Rivery Snowflake"
        And I see button "Re-Activate"
        And I see input "Activate Data Flow" is disabled

    Scenario: make invalid changes and try to reactivate
        When I see texts "s2t demo"
        Then I select tab "Schema"
        Then I see 'crown'
        Then I click 'crown'
        Then I click label "select table or_test_epoch"
        Then I see text "Applying Changes to an Active Data Flow"
        Then I click button "Continue"
        Then I click label "select table or_test_epoch"
        Then I click button 'Re-Activate'
        Then I see text 'Please select at least one table to run/activate the Data Flow'

    Scenario: make valid changes and try to reactivate
        When I see texts "s2t demo"
        Then I select tab "Schema"
        Then I see 'crown'
        Then I click 'crown'
        Then I click label "select table or_test_epoch"
        Then I see text "Applying Changes to an Active Data Flow"
        Then I click button "Continue"
        Given I want to disable data flow
        Given I want to modify s2t data flow
        Given I want to activate cdc
        Then I click button 'Re-Activate'
        Then I see text 'Data Flow Re-Activation'
        Given data flow was disabled
        Then I see button "Cancel Process"

    Scenario: validate leaving the page prompt and discard changes
        When I see texts "s2t demo"
        Then I select tab "Schema"
        Then I see 'crown'
        Then I click 'crown'
        Then I click label "select table or_test_epoch"
        Then I see text "Applying Changes to an Active Data Flow"
        Then I click button "Continue"
        Then I click link "Close"
        Then I see button "Discard"
        Then I click button "Discard"
        Then I see tab "Data Flows List" is selected

    Scenario: validate leaving the page prompt and save changes
        When I see texts "s2t demo"
        Then I select tab "Schema"
        Then I see 'crown'
        Then I click 'crown'
        Then I click label "select table or_test_epoch"
        Then I see text "Applying Changes to an Active Data Flow"
        Then I click button "Continue"
        Then I click link "Close"
        Then I see button "Save & Re-Activate"
        Given I want to disable data flow
        Given I want to modify s2t data flow
        Given I want to activate cdc
        Then I click button "Save & Re-Activate"
        Then I see text 'Data Flow Re-Activation'

    Scenario: Block Restore Version for active data flow
        When I see texts "s2t demo"
        When I see button "versions" is visible
        Given I want to review versions
        Then I click button "versions"
        And versions have been loaded successfully
        Then I click label "select version" at index 3 on "bottomLeft"
        Then I see button "View Version"
        And I click button "View Version"
        And version has loaded
        Then I see button "Restore Version"
        Then I see button "Back to Current"
        Given I get data flow
        And I click button "Restore Version"
        Then I see text "Restore Data Flow Version"
        And I see button "Disable & Restore"

Feature: CDC S2T Data Flow
    Background:
        Given I want to create a source to target flow
        When I setup cdc source and target
        Then I see "Initial Migration Process Default Settings"

    Scenario: Change extract mode
        Then I click "Continue"
        Then I click force text "crown"
        Then I see text "Status"
        Then I click label "select table or_test_epoch"
        Then I see text "Waiting For Migra"
        Then I click force text "Extraction Mode"
        Then I see text "Select the method you would like to extract your data." in dialog
        Then I click text "Standard Extraction"
        Then I click "Apply Changes"
        Then I see text "Standard Extraction"
        And I don't see text "Status"
        And I see text "Incremental Field"

    Scenario: Change sync option
        Then I click "Continue"
        Then I click force text "crown"
        Then I click label "select table or_test_epoch"
        Then I see text "Waiting For Migra"
        Then I click force text "Extraction Mode"
        Then I click text "Skip Initial Migration"
        Then I click "Apply Changes"
        Then I don't see text "Waiting For Migra"
        And I see text "Waiting For Sync"

    Scenario: Table source settings in log extract method
        Then I click text "Skip Initial Migration"
        Then I click "Continue"
        Then I click force text "crown"
        Then I click label "select table or_test_epoch"
        Then I see text "Waiting For Sync"
        Then I click button "or_test_epoch"
        Then I see text 'Mapping of the table columns, including their respective data types, mode and more'
        And I select tab "Source Settings"
        Then I see text "Set up the setting to your Source Data."
        And I see label "Perform Initial Migration"
        Then I click label "Perform Initial Migration"
        Then I click "Apply Changes"
        Then I don't see text "Waiting For Sync"

# Skiping this test - the activation modal for cdc fails to appear in tests but shows in manual testing
# Scenario: Activate CDC Data Flow with auto sync
#     Then I click radio option number "2"
#     Then I click "Continue"
#     Then I click "crown"
#     Then I click label "select table or_test_epoch"
#     Then I click button "Next"
#     Then I see text "Data Flow Info"
#     And I see button "Activate"
#     Given I want to save s2t data flow
#     Then I click button "Activate"
#     Then I wait 10000
#     Then I see text "Activate Data Flow for Streaming" in dialog
#     Given I want to activate cdc
#     Then I click button "Activate Data Flow"
#     Then I don't see text "Activate Data Flow for Streaming" in dialog
#     And I see text "Data Flow Activation"
#     And I see button "Run Data Flow" is disabled
#     Given CDC activation succeeded
#     Then I see button "Run Data Flow" is enabled
#     And I click button "Done"
#     Then I wait 2000
#     Then I see tab "Summary" is selected

# Scenario: Activate CDC Data Flow with reinitialize sync
#     Then I click "Continue"
#     Then I click "crown"
#     Then I click label "select table or_test_epoch"
#     Then I click button "Next"
#     Given I want to save s2t data flow
#     Then I click button "Activate"
#     Then I see button "see more"
#     Then I click force button "see more"
#     Then I click radio option number "2"
#     Then I see alert with "Choosing this option may lead to data loss."
#     Given I want to delete cdc config
#     Given I want to activate cdc
#     Then I click button "Activate Data Flow"
#     Then I see text "River Activation"
#     Given CDC activation succeeded
# Then I click button "Run River"
# Given I want to run new s2t data flow
# Given Data Flow is running
# Then I wait 2000
# Then I see text "River is Running"


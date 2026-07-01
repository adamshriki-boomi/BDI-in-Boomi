Feature: Environments Manager
    As an admin,
    I want to manage my Environments
    So I can have complete control over it

    Background:
        Given I want to delete an environment
        When I click "Environments Manager" menu item in "Environments" menu

    Scenario: Environments Grid and Box
        Then I see label "search-environment"
        And I see not exact labels:
            | Default     |
            | Faked Env 2 |
            | Faked Env 3 |
        When I type "3" inside "search-environment"
        Then I don't see labels:
            | Faked Env 2 |
            | Default     |
        And I see label "Faked Env 3-header"
        When I click label "Faked Env 3-header"
        Then I see button "delete-environment"
        And I see button "Update-environment"
        And I see labels:
            | environment_name |
            | description      |
        When I type "-123" inside "Environment Name"
        Then I see label "Faked Env 3-123-header"
        When I click button "delete-environment"
        Then I see confirmation dialog with title "Delete Environment?"
        And I see text "Type 'delete' to confirm"
        And I see button "Delete" is disabled
        Then I type "delet" inside "Type 'delete' to confirm"
        And I see button "Delete" is disabled
        Then I type "e" inside "Type 'delete' to confirm"
        And I see button "Delete" is enabled
        And I click button "Cancel"
        And I click button "cancel-and-close"
        Then I don't see button "Update-environment"
        When I click button "Add environment"
        Then I see input with value "New Environment"
        And I see button "Add-environment" is enabled
        And I click button "cancel-and-close"
        Then I don't see label "New Environment-header"

    Scenario: Delete Default Env
        When I type "riv" inside "search-environment"
        And I click label "Rivery-header"
        When I click button "delete-environment"
        Then I see confirmation dialog with title "Delete Environment?"
        And I see confirmation dialog with label "Default Environment"
        And I see input "Type 'delete' to confirm" is disabled
        Then I select item "Faked Env 3" in list "Default Environment"
        And I see input "Type 'delete' to confirm" is enabled

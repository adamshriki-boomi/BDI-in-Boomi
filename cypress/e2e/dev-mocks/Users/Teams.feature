Feature: Teams Tab
    As an admin I would like to see the teams in the account
    be able to add a new one, edit an existing one and delete one
    Background:
        Given I want to suppress errors
        Given I am signed in as super admin to the app
        And I navigate to users page
        Given I want to see teams

    Scenario: I see users table
        Then I see tabs "Users, Teams"
        And I see text 'Search Users'
        And I see button "create"
        And I see text "Alon Reznik" in table
        And I see text "# Teams" in table
        And I see text "Source" in table

    Scenario: I can Search for a team
        When I select tab "Teams"
        And I type "Ina" inside "search"
        Given I want to filter teams
        Then I see text "Inara-Group" in table
        And I see text "Inara-AD-Test" in table
        And I don't see text "AD-3" in table

    Scenario: I can view team and its members in drawer
        When I select tab "Teams"
        And I click text "AD-2-Same-Users"
        Then I see text "Edit Team" in dialog
        And I see text "Provisioned Directory Group" in dialog
        And I see text "This team is provisioned and synced from external directory." in dialog
        And I see radio input with label "all-admin" is checked
        Given I want to see only this team users
        Then I select tab "Users"
        Then I see text "Shayke Payke"
        Given I want to see selected user from Group
        Then I click text "Shayke Payke"
        Then I see text "User Info" in dialog
        And I see label "Enable login with sso"
        And I see input with value "Shayke Payke"
        And I see input with value "shayke@alonrvision.onmicrosoft.com"
        And I see button "Back"
        Then I click button "Back"
        Then I see text "Edit Team" in dialog
        Then I click button "Cancel"
        And I don't see dialog
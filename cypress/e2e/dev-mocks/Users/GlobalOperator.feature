Feature: Global Operator and Super Admins Account
    Global Operator role grants admin-level sidebar access without full admin privileges.
    Super Admins Account enables privileged user management (Super Admin / Global Operator).


    Scenario: Global operator sees Settings menu in sidebar
        Given I want to suppress errors
        Given I am signed in as global operator to the app
        When I click button "Settings"
        Then I see link "Account Settings"
        And I see link "Users"
        And I see link "API Tokens"

    Scenario: Global operator can navigate to the Users management page
        Given I want to suppress errors
        Given I am signed in as global operator to the app
        And I navigate to users page
        Then I see text "Search Users"

    Scenario: Global operator sees environment admin menu items in sidebar
        Given I want to suppress errors
        Given I am signed in as global operator to the app
        When I click "Environments Manager" menu item in "Environments" menu
        Then I see in url "environments"

    Scenario: Viewer cannot see Settings menu
        Given I want to suppress errors
        Given I am signed in as viewer to the app
        Then I don't see text "Settings"
        And I don't see button "Environments"
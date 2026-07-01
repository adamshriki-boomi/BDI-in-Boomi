Feature: Settings Menu
    As a system admin
    I want to open the settings menu
    So I can navigate to settings screens

    Scenario: Display Settings screen for super admin
        When I click button "Settings"
        Then I see link "Account Settings"
        Then I see link "Users"
        Then I see link "API Tokens"
        When I click link "Account Settings"
        Then I see in url "settings/"
        And I see tab "Account Settings (Boomi Internal)" is selected


    Scenario: Display Settings screen for admin
        Given I am signed in as admin user to the app
        And I don't see text "Boomi Internal"
        When I click button "Settings"
        Then I see text "Account Settings"
        When I click menu button "Account Settings"
        Then I see in url "settings/"
        And I see tab "General" is selected
        And I don't see text "Boomi Internal"
        When I click button "Settings"
        Then I see link "Users"
        Then I see link "API Tokens"
        When I click menu button "API Tokens"
        Then I see in url "tokens/"
        And I see button "Environments"

    Scenario: Hide Settings menu for non admins
        Given I am signed in as viewer to the app
        Then I don't see text "Settings"
        And I don't see button "Environments"

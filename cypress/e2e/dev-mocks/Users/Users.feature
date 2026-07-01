Feature: Users Page
    As an admin I would like to see the users in the account
    be able to add a new one, edit an existing one, delete and deactivate.
    Background:
        Given I want to suppress errors
        Given I am signed in as admin user to the app
        And I navigate to users page

    Scenario: I see users table
        Then I see text 'Search Users'
        And I see button "create"
        And I see text "Alon Reznik" in table

    Scenario: I can edit user info
        Given I want to view user
        Given I want to view user permissions
        Given I want to edit user environments
        When I click text "Alon Reznik"
        Then I see dialog
        And I see text "Edit User" in dialog
        And I see input "Full Name" with value "Alon Reznik"
        And I see input "Email Address" with value "a12@alonrvision.onmicrosoft.com"
        Then I see checkbox with label "Enable login with email and password" is checked
        Then I see checkbox with label "Enable login with email and password" is checked
        Then I click label "all-admin"
        Then I click button "Apply Changes"
        Then I click button "Keep Until Next Login"
        Then I see toast with "a12@alonrvision.onmicrosoft.com was Edited"

    Scenario: Add User
        Given I want to add a new user
        When I see button "create" is visible
        Then I click button "create"
        Then I see dialog
        Then I see texts "Add User" in dialog
        Then I type "Luke Skywalker" to "Full Name"
        And I type "luke@skywalker.io" to label "Email Address"
        Then I click button "Add User"
        Then I don't see dialog
        Then I see toast with "luke@skywalker.io was Invited"

    Scenario: Check fields validation in user drawer
        Given I want to add a new user
        When I see button "create" is visible
        Then I click button "create"
        Then I see dialog
        And I see button "Add User" is disabled
        And I type "charlesManson" to "Email Address"
        Then I see text "Please enter a valid email address" in dialog
        And I see button "Add User" is disabled
        When I clear "Email Address"
        And I type "charlesManson@rivery.io" to label "Email Address"
        Then I don't see text "Please enter a valid email address" in dialog
        Then I type "Charles Manson" to "Full Name"
        And I see button "Add User" is enabled

    Scenario: Delete User
        Given I want to delete a user
        When I click menu "users-menu-0" and select "Delete"
        Then I see text "Please Confirm Delete"
        And I see button "Delete"
        And I see button "Cancel"
        When I click "Delete"
        Then I don't see text "Please Confirm Delete"
        And I see toast with "User was deleted"





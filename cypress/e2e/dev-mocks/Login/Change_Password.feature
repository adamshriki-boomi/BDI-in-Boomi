Feature: Change Password
    As a user in the system,
    I want to set a new password for my account

    Background:
        And I want to change my current password

    Scenario: Change password
        When I click label "user-menu"
        And I click button "Change Password"
        Then I see dialog
        And I see label "Current Password"
        And I see label "New Password"
        Then I type "faked-password" inside "Current Password"
        And I click submit inside form 'password form'
        Then I see text "Repeat New Password is required" in dialog
        Then I type "!NewPassword1" inside "New Password"
        Then I type "!NewPassword1" inside "Repeat New Password"
        Then I click submit inside form 'password form'
        And I wait for password to change
        Then I see toast with "Password Changed"


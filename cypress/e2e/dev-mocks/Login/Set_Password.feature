Feature: Reset Password
  As a data analyst that was invited to rivery
  I want to set my password
  So I can login to the app

  Scenario: Set Password from email invite
    Given I want to set a valid password
    And I open an email invite
    Then I see texts "Set Password"
    And I see labels:
      | Password     |
      | Set Password |
    When I type "Test!123" inside "Password"
    And I click label "Set Password"
    Then I see text "Password is updated"
    And I see text "Your password changed successfully."
    And I see text "Log In"

  Scenario: Show password validation errors
    Given I want to set a valid password
    And I open an email invite
    Then I see texts "Set Password"
    And I see labels:
      | Password     |
      | Set Password |
    When I type "Test12" inside "Password"
    And I click label "Set Password"
    Then I see text "Password does not meet requirements"

  Scenario: Show Errors from server
    Given I want to set an invalid password
    And I open an email invite
    Then I see texts "Set Password"
    And I see labels:
      | Password     |
      | Set Password |
    When I type "Test!12345678" inside "Password"
    And I click label "Set Password"
    And I see text "Password Change Failed!"


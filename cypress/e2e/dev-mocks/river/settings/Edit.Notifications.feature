Feature: Edit River Schedule
  As a data analyst I want to set notifications So I could understand the status of my rivers

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    When I select tab "Settings"

  Scenario: Toggle Notifications
    Then I don't see label "edit-failure-notifications-email"
    When I switch "Send Notification on failure"
    Then I see input "edit-failure-notifications-email" with multi value "{Mail_Alert_Group}"

    Then I don't see label "edit-runtime threshold-notifications-email"
    When I switch "Send Notification on runtime threshold"
    Then I see input "edit-runtime threshold-notifications-email" with multi value "{Threshold_Mail_Alert_Group}"
    Then I see input "edit-runtime threshold-notifications-email" with multi value "{Threshold_Mail_Alert_Group}"

    Then I see "40 minutes" inside "run-notification-timeout"
    When I clear type "1201{enter}" to "run-notification-timeout"
    Then I see placeholder "00:20:01" in list "run-notification-timeout"

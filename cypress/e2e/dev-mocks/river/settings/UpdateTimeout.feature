Feature: Edit River Schedule
  I want to set timeout So I could control my running rivers

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    When I select tab "Settings"
    When I switch "Enable Schedule"

  Scenario: Select custom timeout
    When I clear type "1200" to "timeout"
    Then I see "20 minutes" inside "timeout options list"
    When I clear type "1200{enter}" to "timeout"
    Then I see "20 minutes" inside "timeout"
    When I clear type "1201" to "timeout"
    Then I see "1201 seconds" inside "timeout options list"
    Then I see "\(00:20:01\)" inside "timeout options list"
    When I clear type "1201{enter}" to "timeout"
    Then I see placeholder "00:20:01" in list "timeout"

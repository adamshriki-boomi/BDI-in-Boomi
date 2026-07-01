Feature: Edit River Schedule
  As a data analyst I want change the schedule to my river So I could reuse and automate my rivers

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    When I select tab "Settings"

  Scenario: Test Custom Expressions Summary
    Then I see switch "Enable Schedule" is off
    When I switch "Enable Schedule"
    When I click label "schedule summary"
    Then I see labelled "schedule summary" with value "At 05:00 and 10:00, Sunday through Thursday"
    When I clear type "0 41 7 ? * MON,TUE *" to "edit custom"
    Then I see labelled "schedule summary" with value "At 07:41, only on Monday and Tuesday"
    When I type "{esc}" to "edit custom"
    When I click label "schedule summary"

    When I select option "Custom" of "schedule type"
    When I clear type "0 41 6 ? 1/2 MON *" to "edit custom"
    Then I see labelled "schedule summary" with value "At 06:41, only on Monday, every 2 months"
    When I type "{esc}" to "edit custom"
    When I click label "schedule summary"

    When I select option "Custom" of "schedule type"
    When I clear type "0 41 6 5 3 ? *" to "edit custom"
    Then I see labelled "schedule summary" with value "At 06:41, on day 5 of the month, only in March"
    When I type "{esc}" to "edit custom"
    When I click label "schedule summary"
    Then I see option "Custom" of "schedule type" is selected
    Then I see option "Monthly" of "schedule type" is unselected

  Scenario: Edit schedule
    Then I see switch "Enable Schedule" is off
    When I switch "Enable Schedule"
    Then I see switch "Enable Schedule" is on
    Then I don't see label "schedule editor"
    When I click label "schedule summary"
    Then I see label "schedule editor"
    When I select option "Minutes" of "schedule type"
    # Then I see labelled "schedule summary" with value "Every 5 minutes, every hour, every day"
    When I clear type "10{enter}" to "minutes"
    Then I see labelled "schedule summary" with value "Every 10 minutes, every hour, every day"

    When I select option "Custom" of "schedule type"
    When I clear type "0 2/17 * * * * *" to "edit custom"
    Then I see labelled "schedule summary" with value "Every 17 minutes, starting at 2 minutes past the hour, every hour, every day"

    When I select option "Hourly" of "schedule type"
    When I clear type "2" to "edit hours"
    When I clear type "12:17{enter}" to "time of day"
    Then I see labelled "schedule summary" with value "At 17 minutes past the hour, every 2 hours, starting at 12:00, every day"

    When I select option "Daily" of "schedule type"
    When I clear type "3" to "edit days"
    When I clear type "11:23 pm{enter}" to "time of day"
    Then I see labelled "schedule summary" with value "At 23:23, every 3 days"

    When I select option "Weekly" of "schedule type"
    When I click "Tu" at index 1 inside "select day of week"
    When I click "Th" at index 1 inside "select day of week"
    Then I see labelled "schedule summary" with value "At 23:23, only on Tuesday and Thursday"

    When I select option "Monthly" of "schedule type"
    When I clear type "4" to "edit months"
    When I click "27" at index 1 inside "select day of month"
    Then I see labelled "schedule summary" with value "At 23:23, on day 1 and 27 of the month, every 4 months"

  Scenario: Try to save invalid custom expression
    Then I see switch "Enable Schedule" is off
    When I switch "Enable Schedule"
    When I click label "schedule summary"
    When I select option "Custom" of "schedule type"
    When I clear type "0 41 6 ? 1/2 MON *" to "edit custom"
    Then I see labelled "schedule summary" with value "At 06:41, only on Monday, every 2 months"
    When I clear type "0 41 6 ? 1/2 MON * a" to "edit custom"
    Then I see labelled "schedule summary" with value "At 06:41, only on Monday, every 2 months"
    When I clear type "0 41 6 ? 1/2 MON" to "edit custom"
    Then I see labelled "schedule summary" with value "At 06:41, only on Monday, every 2 months"

  Scenario: Try to save empty custom expression
    Then I see switch "Enable Schedule" is off
    When I switch "Enable Schedule"
    When I click label "schedule summary"
    When I select option "Custom" of "schedule type"
    When I clear "edit custom"
    Then I see labelled "schedule summary" with value "At 05:00 and 10:00, Sunday through Thursday"



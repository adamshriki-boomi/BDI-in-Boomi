Feature: Dashboard
  As a user
  I want to see the dashboard
  So I can track performance and review recent activity

  Background:
    Given I want to see the dashboard

  Scenario: I see the dashboard page
    Then I see text "Good"
    Then I see texts "John Doe"
    Then I see text "Data Flows Activity View By Executions"
    Then I see text "Success Rate"
    Then I see text "Boomi Data Unit"

  Scenario: I switch to source view
    When I switch to source view
    Then I see text "Google Ads"
    Then I see text "HubSpot"
    Then I see text "SalesForce"

  Scenario: I filter by source
    Then I see text "32,165"
    When I select item "Google Ads" in list "Source"
    Then I see text "8,565"
    When I switch to source view
    Then I see text "Google Ads"
    Then I don't see text "HubSpot"
    Then I don't see text "SalesForce"

  Scenario: I filter by date range
    Then I see text "32,165"
    When I select item "Last 30 Days" in list "date picker"
    Then I see text "128,835"

  Scenario: I filter by custom date range
    Then I see text "32,165"
    When I pick custom date range from day "4" to day "6"
    Then I see text "13,050"

  Scenario: I switch chart metric by clicking KPI cards
    Then I see text "Data Flows Activity View By Executions"
    When I click text "Success Rate"
    Then I see text "Data Flows Activity View By Success Rate"
    When I click text "Boomi Data Unit (BDU) Credits"
    Then I see text "Data Flows Activity View By Boomi Data Unit"
    When I click text "Executions"
    Then I see text "Data Flows Activity View By Executions"

  Scenario: I reset to default after filtering
    Then I see text "32,165"
    When I select item "Google Ads" in list "Source"
    Then I see text "8,565"
    When I select item "Last 30 Days" in list "date picker"
    Then I see text "33,510"
    When I switch to source view
    Then I see text "Google Ads"
    Then I wait 4000
    When I click "Reset to Default" menu item in "More options" menu
    Then I wait 4000
    Then I see text "32,165"
    Then I see text "Data Flows Activity View By Executions"
    Then I don't see text "Google Ads"

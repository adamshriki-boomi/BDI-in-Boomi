Feature: Test Rivers
  Background:
    Given I mock filtered rivers
    Given I mock filtered river type
    When I click sidebar "Data Flows"

  Scenario: Visit Rivers
    Then I see button "tooltip icon apiV2"
    Then I hover button "tooltip icon apiV2"
    Then I see text "This Data Flow is managed by API"

  Scenario: Toggle Rivers view type
    When I see text "Search Data Flow"
    When I select tab "Groups"
    Then I don't see text "Search Data Flow"
    And I see text "Search Group"

  Scenario: Groups - Show all filter
    Then I see "1 Data Flows"
    When I select item "pineapple" in list "Data Flow Group"
    When I wait 0
    Then I see text "0 Data Flows"
    When I select item "guitars" in list "Data Flow Group"
    Then I see "1 Data Flows"
    When I click button "Clear"
    Then I see "1 Data Flows"

  Scenario: Types - Show all filter
    Then I see "1 Data Flows"
    When I select item "Logic" in list "Data Flow Type"
    When rivers of type logic completed loading
    Then I see "0 Data Flows"
    Given I want to filter by action river
    Then I wait 500
    When I select item "Action" in list "Data Flow Type"
    When there are no results
    Then I see "0 Data Flows"
    When I click button "Clear"
    Then I see "1 Data Flows"

  Scenario: Display Friendly Message when searching non existing river
    Given I search a non existing river
    When I type "non existing" to "search-Data Flows"
    And there are no results
    And I see text "We searched everywhere but found nothing."
    And I see text "Try redefining your search or use different keywords."

  Scenario: Display Friendly Message when there are no rivers
    Given there are no rivers in my account
    When I click sidebar "Dashboard"
    And I click sidebar "Data Flows"
    And there are no results
    Then I see text "Not even a single Data Flow to show"

  Scenario: I want to Delete a river
    Given app is ready to test river page
    When I force click menu "river Simple River Logic Example actions" and select "Delete Data Flow"
    Then I see text "This will permanently delete data flow:"
    And I see text "Are you sure you want to delete it?"
    When I click button "Yes"
    Then rivers request was sent

  Scenario: Close River
    Given app is ready to test river page
    Then I click link "Simple River Logic Example"
    Then I click label "close data flow"
    Then I see text "Leave this data flow?"
    Then I click button "Keep editing"
    Then I see texts "Simple River Logic Example" 2 times

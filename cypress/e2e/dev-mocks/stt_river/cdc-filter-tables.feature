Feature: CDC Filter Tables
  Background:
    Given I want to view a source to target flow with cdc-eligible and non-eligible tables
    And I want to see schemas
    And I want to see cdc filter tables
    When I navigate to Stt data flow
    And I select tab "Schema"
    And I click 'crown'

  Scenario: popup appears with non-eligible table names when switching to CDC
    When I click force text "Extraction Mode"
    And I click force text "CDC (Change Data Capture)"
    And I click "Apply Changes"
    Then I see text "Some objects aren't supported in CDC mode"
    And I see text "table_cdc_view_ineligible" within "cdc unsupported tables modal"
    And I see text "table_cdc_synonym_ineligible" within "cdc unsupported tables modal"

  Scenario: closing the popup cancels the switch and keeps all tables selected
    When I click force text "Extraction Mode"
    And I click force text "CDC (Change Data Capture)"
    And I click "Apply Changes"
    Then I see text "Some objects aren't supported in CDC mode"
    When I click button "Close"
    Then I don't see text "Some objects aren't supported in CDC mode"
    When I click force text "Cancel"
    Then I see checkbox "select table table_cdc_view_ineligible" is checked
    And I see checkbox "select table table_cdc_synonym_ineligible" is checked

  Scenario: Remove All & Switch removes non-eligible tables and completes the CDC switch
    When I click force text "Extraction Mode"
    And I click force text "CDC (Change Data Capture)"
    And I click "Apply Changes"
    Then I see text "Some objects aren't supported in CDC mode"
    When I click button "Remove All & Switch"
    Then I see checkbox "select table table_cdc_view_ineligible" is unchecked
    And I see checkbox "select table table_cdc_synonym_ineligible" is unchecked
    And I see text "Showing CDC-eligible objects only"

  Scenario: eligible tables remain selected after Remove All & Switch
    When I click force text "Extraction Mode"
    And I click force text "CDC (Change Data Capture)"
    And I click "Apply Changes"
    Then I see text "Some objects aren't supported in CDC mode"
    When I click button "Remove All & Switch"
    Then I see checkbox "select table table_cdc_eligible" is checked
    And I see checkbox "select table table_cdc_synonym_eligible" is checked

  Scenario: switching back to standard after Remove All & Switch does not restore non-eligible tables
    When I click force text "Extraction Mode"
    And I click force text "CDC (Change Data Capture)"
    And I click "Apply Changes"
    Then I see text "Some objects aren't supported in CDC mode"
    When I click button "Remove All & Switch"
    Then I see checkbox "select table table_cdc_view_ineligible" is unchecked
    When I click force text "Extraction Mode"
    And I click force text "Standard Extraction"
    And I click "Apply Changes"
    Then I see checkbox "select table table_cdc_view_ineligible" is unchecked
    And I see checkbox "select table table_cdc_synonym_ineligible" is unchecked
Feature: Table - Default Incremental Behavior
  Background:
    Given I want to view shopify_graphql source to target flow
    And I want to see schemas
    And I want to see increment required tables
    When I navigate to Stt data flow
    And I select tab "Schema"
    And I click 'crown'
    Then I see 'table_standard'

  Scenario: standard table shows extract method selector in the schema row
    When I click label "select table table_standard"
    Then I see value "All" is selected in list "select table_standard extract method"

  Scenario: no_increment table shows All as plain text and hides extraction method in settings
    When I click label "select table table_no_increment"
    Then I don't see label "select table_no_increment extract method"
    And I see text "All" within "table_no_increment extract method text"
    When I click button "table_no_increment"
    And I select tab "Source Settings"
    Then I don't see text "Extraction Method"

  Scenario: increment_required table shows Incremental as plain text in schema row and hides extraction method radio in settings
    When I click label "select table table_increment_required_default_col"
    Then I don't see label "select table_increment_required_default_col extract method"
    And I see text "Incremental" within "table_increment_required_default_col extract method text"
    When I click button "table_increment_required_default_col"
    And I select tab "Source Settings"
    Then I don't see label "extraction method"
    And I see texts "Incremental Field"

  Scenario: increment_required table with single column auto-selects it on table select
    When I click label "select table table_increment_required_single_col"
    Then I see default value "created_at" selected in list "select table_increment_required_single_col incremental field"

  Scenario: increment_required table with is_default column auto-selects the default column on table select
    When I click label "select table table_increment_required_default_col"
    Then I see default value "updated_at" selected in list "select table_increment_required_default_col incremental field"

  Scenario: increment_required table with date_range increment_defaults auto-fills the date range on table select
    When I click label "select table table_increment_required_date_range"
    Then I see default value "synced_at" selected in list "select table_increment_required_date_range incremental field"
    And I see label "table_increment_required_date_range timestamp"
Feature: Create - Inline Edit Schema's tables
  Background:
    Given I want to create a source to target flow
    When I setup source and target
    Then I see 'or_test_epoch'
    When I click label "select table or_test_epoch"
    Then I see button "or_test_epoch target_table"

  Scenario: edit table target name
    Then I see texts "or_test_epoch" 2 times
    When I click button "or_test_epoch target_table"
    And I clear "or_test_epoch target_table"
    And I type "Evergrey" to "or_test_epoch target_table"

  Scenario: edit extract method as running number
    When I select item "Incremental" in list "select or_test_epoch extract method"
    When I select item "id" in list "select or_test_epoch incremental field"
    And I scroll to "End Value"
    Then I see "Running Number"
    When I type "4" to "or_test_epoch start_value"
    And I type "10" to "or_test_epoch end_value"
    Then I see input with value "4"
    Then I see input with value "10"

  Scenario: edit extract method as datetime
    When I select item "Incremental" in list "select or_test_epoch extract method"
    When I select item "from_date" in list "select or_test_epoch incremental field"
    And I scroll to "End Value"
    Then I see "Timestamp"
    And I see label "or_test_epoch timestamp"
    When I click label "or_test_epoch timestamp"
    And I see label "Date Range"
    And I see button 'Apply Changes'

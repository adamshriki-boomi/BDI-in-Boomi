Feature: Create Source To Target Data Flow - Edit Table Settings
  Background:
    Given I want to create a source to target flow

  Scenario: open table settings
    When I setup a new s2t data flow
    Then I see texts 'id'
    Then I see texts 'epoch'

  Scenario: edit match key
    When I setup a new s2t data flow
    When I click "Match Key"
    And I click 'epoch'
    And I click button 'move to match key'
    When I click 'All Columns'
    Then I see button 'unset epoch as key'

  Scenario: edit cluster
    When I setup a new s2t data flow
    When I select option "Cluster" of "type"
    Then I see "Arrange Columns"
    When I click 'epoch'
    And I click 'id'
    And I click button 'move to arranged'
    When I click 'All Columns'
    Then I see label "cluster epoch 1"

  Scenario: add calculated column
    When I setup a new s2t data flow
    Then I see "Add Calculated Column"
    When I click "Add Calculated Column"
    Then I see "Avoid using reserved words"
    When I type "evergrey" to "Target Column Name"
    When I type "select * from 'connections'" to "Expression"
    When I select item "NULLABLE" in list "Mode"
    When I select item "STRING" in list "Data Type"
    When I click "Add Column"
    Then I see "evergrey"

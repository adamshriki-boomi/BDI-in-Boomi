Feature: Groups Selector
  As a data analyst,
  I want to be able to edit a group,
  so I could: perform edit operations on a group and all groups.

  Background:
    When logic river page is displayed

  Scenario: Filtering Groups
    When I click button "group guitars"
    And I type "ultimate GUITARS" to "filter groups"
    Then I see button "ultimate guitars"

  Scenario: Clear Filter
    When I click button "group guitars"
    And I type "ultimate GUITARS" to "filter groups"
    Then I see text 'ultimate GUITARS'
    When I click button "clear filter"
    Then I see placeholder "filter groups..."
    And I see button "pineapple"
    And I see button "cherry"
    And I see button "lunatic soul 2"

  Scenario: Change Group
    When I click button "group guitars"
    And I click button "pineapple"
    Then I see button "group pineapple"
    When I click button "group pineapple"
    Then I see button "pineapple"
    Then I see button "cherry"
    Then I see button "lunatic soul 2"

  Scenario: Create New Group
    When I click button "group guitars"
    And I click button "+ Create New Group"
    Then I see text "Add New Group"
    Given I want to save a new group in selector
    And I click button "Save"
    Then I see text "Group Name Is required"
    When I type "cherry" to "Group Name"
    And I click button "#ed9750"
    And I click button "smily #ed9750"
    And I click button "Save"
    Then group is "created" successfully
    And I see button "group cherry"

  Scenario: Edit Group
    When I click button "group guitars"
    And I hover button "Amazing"
    When I click force button "edit group Amazing"
    Then I see text "edit group"
    Then I see labels:
      | label              |
      | Group Name         |
      | color #ffd300      |
      | icon #ffd300 crown |
    When I click button "#33c7bd"
    Then I see button "candy #33c7bd"
    Given I want to save changes to a group
    When I click button "Save"
    Then group is "saved" successfully

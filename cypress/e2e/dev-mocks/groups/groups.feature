Feature: Test Groups
  Background:
    When I click sidebar "Data Flows"
    When I select tab "Groups"
    # And I click label "show-list"
    And I wait for groups
    Then I see text "67 Groups"
    And I see text "cherry"

  Scenario: Edit Group
    Given I want to save changes to group
    And I don't see text "cherry-test"
    When I click "Edit Group" menu item in "group cherry actions" menu
    And I type "-test" to "Group Name"
    Then I see checkbox "Default Group" is unchecked
    And I click button "Save"
    Then group is "saved" successfully
    Then group is "refreshed" successfully
    And I see text "cherry-test"

  Scenario: Edit Default Group
    Given I want to save changes to group
    And I don't see text "cherry-test"
    When I click "Edit Group" menu item in "group ultimate guitars actions" menu
    Then I see checkbox "Default Group" is checked
    Then I see input "Default Group" is disabled

  Scenario: Delete Group
    Given I want to delete a group
    When I click "Delete Group" menu item in "group cherry actions" menu
    And I click button "Yes"
    Then group is "removed" successfully
    And I don't see text "pineapple"
    And I see text "66 Groups"

  Scenario: Create Group
    Given I want to save a new group
    Then I don't see text "test-new-group"
    When I click button "New Group"
    And I type "test-new-group" to "Group Name"
    And I click button "Save"
    Then group is "created" successfully
    # to see the created group on top of the list we need a new task
    # Then I see text "test-new-group" is visible
    And I see text "68 Groups" is visible

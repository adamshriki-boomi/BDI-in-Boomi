Feature: Create Source To Target Data Flow
  Background:
    Given I want to create a source to target flow
    When I setup source and target
    Then I see 'or_test_epoch'

  # Scenario: loading schemas and tables
  # Then I see input with placeholder 'Search Tables...'
  # Then I see 'NewTable2'
  # Then I see texts "Untracked"

  # These tests are not working because new source to target is not open

  Scenario: I want to trigger the exit data flow confirmation modal
    Then I click text "Create"
    Then I click link with aria-label "src_to_fz"
    Then I see text "Exit Data Flow Creation"
    Then I see button "Exit Without Saving"
    Then I click button "Exit Without Saving"
    Then I don't see text "Exit Data Flow Creation"
    And I see text "Select the Data Source you want to establish a connection with."

  Scenario: I want to trigger the exit data flow confirmation modal when drawer is open
    Then I click button "variables"
    Then I click text "Create"
    Then I click link with aria-label "src_to_fz"
    Then I see text "Exit Data Flow Creation"
    Then I see button "Exit Without Saving"
    Then I click button "Exit Without Saving"
    Then I don't see text "Exit Data Flow Creation"
    And I see text "Select the Data Source you want to establish a connection with."

  Scenario: selecting tables
    When I click label "select table or_test_epoch"
    When I click label "select table NewTable2"
    # Then I see text "02/89"
    # Then I see texts "Waiting for Migration" 2 times
    # Then I see texts "Untracked"
    Then I see list 'select or_test_epoch extract method' has selection

  # Scenario: validating next
  #   Then I see button "Next" is disabled
  #   When I click label "select table or_test_epoch"
  #   Then I see button "Next" is enabled
  #   When I click label "select table or_test_epoch"
  #   Then I see button "Next" is disabled

  # Scenario: deselect all tables
  # When I click label "deselect crown tables"
  # Then I see text "00/89"
  # Then I don't see "Waiting for Migration"
  # Then I see texts "Untracked"
  # When I click label "select table or_test_epoch"
  # When I click label "select table NewTable2"
  # Then I see text "02/89"

  Scenario: edit table target name
    When I click label "select table or_test_epoch"
    Then I see button "or_test_epoch target_table"
    When I click label "or_test_epoch target_table"
    When I type "DUST" to label "or_test_epoch target_table"
  # When I click "Waiting For Migration"
  # Then I see "DUST"

  # Scenario: select and deselect all tables from table header
  # Then I see text "00/89"
  # When I click menu "tables selector" and select "Select All"
  # Then I see text "03/89"
  # When I click menu "tables selector" and select "Deselect All"
  # Then I see text "00/89"

  Scenario: search for schemas
    Given I want to search for schemas
    When I type "crown" to label "search schema"
    Then I see "crown_of_thornes"
    And I see "crownlands"

  Scenario: search for tables
    Given I want to search for tables
    When I type "new" to label "search tables"
    Then I see "NewTable test space"
    And I see "NewTable2"
    And I don't see "or_test_epoch"

  Scenario: Next page is not displayed for under 100 pages
    Given I want to see the next page in tables
    Then I see button "goto next page" is disabled

  Scenario: Previous page is not displayed on first page
    Given I want to see the next page in tables
    Then I see button "goto previous page" is disabled

  Scenario: scheduling a data flow
    When I click label "select table or_test_epoch"
    When I click label "select table NewTable2"
    Then I see button 'Next' is enabled
    When I click button 'Next'
    Then I see "Schedule Data Flow"
    Then I see "Set the frequency at which you would like the Data Flow to run"
    Then I see "every day"
    When I click label "schedule summary"
    When I click label "schedule daily"
    And I click text "Mo"
    And I click text "Th"
    Then I see "only on Monday and Thursday"

  Scenario: save data flow
    When I click label "select table or_test_epoch"
    When I click label "select table NewTable2"
    Then I see link 'Save & Exit'
    Given I want to save s2t data flow
    When I click link 'Save & Exit'

    Then I see text 'Exit Data Flow Creation'
    And I see button "Save & Exit"
    Then I click button "Save & Exit"
    Then I don't see in url "new"
# Then I see texts "or_test_epoch"


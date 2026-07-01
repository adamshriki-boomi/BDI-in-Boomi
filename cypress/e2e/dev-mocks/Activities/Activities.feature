Feature: Activities
  As a user
  I want to see activities in my account
  So I can see the current status of my rivers

  Background:
    Given I want to see activities
    When I click sidebar "Activities"

  Scenario: I see activities
    When activities data has completed loading
    Then I see "Status"
    Then I see "Search"
    Then I see "Data Flow Type"
    Then I see "Groups"
    Then I see "Date"
    Then I see text "Current Day"
    Then I see text "Runs Segmentation"
    Then I see text "Running" is visible
    Then I see text "Succeeded" is visible
    Then I see text "Failed" is visible
    Then I see text "Pending" is visible
    Then I see texts "BDU"
    Then I see text "<0.01"
    Then I see text "5M"
    Then I see text "42"
    Then I see in url all default filters
    Then I see link "Basic Python Test"
    Then I see link "Test Athena Logic_copy"
    Then I see label "breadcrumb"

  Scenario: display last 30 runs bar charts
    When activities data has completed loading
    # NOT showing up on ci
    # And Graph has completed loading
    Then I see bar charts "last 30 runs bar chart"
    When I select "Succeeded" in Status
    Then I see results filtered by "Status" with "succeeded"
    Then I see in url "status=succeeded"
    Then I see text "tomer testing"
    When I select "pineapple" in Groups
  # Then I see results filtered by "Group" with "60cbad0f1150424c3dc810e3"
  # Then I see in url "group_id="
  # When I select "Scheduled" in Scheduled
  # Then I see results filtered by "Schedule" with "true"
  # Then I see in url "is_scheduled=true"

  # Scenario: display no results message
  #   Given I want to see no activities message
  #   When I visit Monitoring
  #   And activities data has completed loading
  #   Then I wait 3000
  #   Then I see text "Nope... No results in sight"
  #   And I see text "No results matched your criteria. Try re-defining your search."

  Scenario: test clickable kpi's
    When activities data has completed loading
    When I click label "succeeded-status-box"
    # Then I see results filtered by "Status" with "succeeded"
    Then I see in url "status=succeeded"
    When I click label "failed-status-box"
    # Then I see results filtered by "Status" with "failed"
    Then I see in url "status=failed"
    When I click label "failed-status-box"
    Then I don't see in url "status=failed"

  Scenario: clear filters
    And activities data has completed loading
    When I select "Succeeded" in Status
    Then I see results filtered by "Status" with "succeeded"
    When I click button "Clear"
    Then I don't see text 'Succeeded'

  Scenario: View Logic River Activities
    Given I want to see Logic activities
    When I click link "logic Basic Python Test"
    # And I see button "Go to Data Flow"
    Then I see labels:
      | status          |
      # | date picker     |
      | logic runs list |

    Then I wait 5000
    Then I see texts "Simple River Logic Example" 2 times
    Then I see breadcrumbs with "Simple River Logic Example"
    Then I click link "run-0"
    And I see text "Logic Step" in table
    When I click text "Logic Step"
    Then I see dialog
    And I see text "Logic Step Log" in dialog
    And I see labels:
      | Account ID        |
      | Environment ID    |
      | Step ID           |
      | Step Execution ID |
      | Step Counter      |
      | Step Duration     |
      | Step Status       |

  Scenario: View S2T River Activities
    Given I want to see activities
    When I click sidebar "Activities"
    Given I want to see S2T activities
    When I click label "Jira | Test"
    And Activities Schedulers have completed loading
    Then I see labels:
      | status |
    # | date picker |
    Then I see texts "Jira | Test"
    Then I click link "run-0"
    When I click cell text "jira_project"
    Then I see dialog
    And I see text "Send By Email" in dialog
    And I see labels:
      | Task Id      |
      | Run Time     |
      | Run Duration |
      | Source       |
      | Target       |
    Then I click label "Close"
    Then I don't see dialog
    Then I see text "28h 03m 28s" in table
  # And I see button "download-log"
  # And I click button "download-log"
  # Then I see toast
  # Given Download was completed
  # Then I see text "Download completed!"
  # And I don't see text "Download in progress"

  # Scenario: Retry Failed S2T Data Flow Run
  #   Given I want to see activities
  #   When I visit Monitoring
  #   Given I want to see failed S2T activities
  #   When I click label "Jira | Test"
  #   And I click label "run-1"
  #   Then I see button "retry table"
  #   When I click force button "retry table"
  #   Then I see toast with "Run in progress"

  Scenario: View Action River Activities
    Given I want to see Action activities
    When activities data has completed loading
    Then I see text "Basic Python Test" is visible
    When I click label "Untitled Data Flow 2022-06-16 14:48"
    Then I see labels:
      | status |
    # | date picker |
    Then I see texts "Untitled Data Flow 2022-06-16 14:48"
    And I see link "Go to Data Flow"
    And I click label "run-0"
  # And I see labels:
  #   | Download Log |
  #   # | Status       |
  #   | Task ID      |
  #   | Run Time     |
  #   | Run Duration |
  #   | Source       |


  Scenario: View failed Action River Activities
    Given I want to see failed Action activities
    When I click label "Untitled Data Flow 2022-06-16 14:48"
    And I click label "run-1"
  # Then I see button "retry run"

  Scenario: View S2T Sub Rivers Activities
    Given I want to see failed Action activities
    When I click label "Untitled Data Flow 2022-06-16 14:48"
    And I click label "run-1"
  # Then I see button "retry run"

  Scenario: View S2T Sub Rivers Activities
    Given I want to see S2T sub river activities
    When I click label "Source to target with sub river"
    Then I see labels:
      | status |
    # | date picker |
    Given I want to test errors
    And I click label "run-0"
    When Activities Sub Rivers have completed loading
    Then I see text "Sub river 2" is visible
    Then I see text "jira_project" is visible
    Then I see text "jira_group_users"
    When I click text "Tables"
    Then I don't see text "jira_project"
    Then I don't see text "jira_group_users"

  Scenario: View S2T Sub Rivers Sub Rivers Activities
    Given I want to see S2T sub river activities
    When I click label "Source to target with sub river"
    Then I see texts "Source to target with sub river"
    When I click label "Sub-Data Flows-button"
    And I click label "run-0"
    And Activities Sub Rivers have completed loading
    Then I see text "Sub river 2" is visible
    Then I see text "jira_project" in table
    Then I see text "jira_group_users" in table
    Then I see text "Run Date" is visible
    Then I see texts "Sub-Data Flows" 2 times
    Then I see text "00h 02m 33s" is visible

  Scenario: Cancel Run From Activities to a logic river
    Given I want to see Logic activities
    When I click link "Basic Python Test"
    And I see link "Go to Data Flow"
    And I see button "Cancel" is visible
    And I want to cancel a run
    When I click button "Cancel"
    Then I click "Stop Run" inside "cancel run modal"
    Then I see toast with "Run was canceled"

  Scenario: Cancel Run From Activities to a action river
    Given I want to see failed Action activities
    When I click label "Untitled Data Flow 2022-06-16 14:48"
    And I see link "Go to Data Flow"
    And I see button "Cancel" is visible
    And I want to cancel a run
    When I click button "Cancel"
    Then I click "Stop Run" inside "cancel run modal"
    Then I see toast with "Run was canceled"

  Scenario: Cancel Run From Activities to a action s2t river
    Given I want to see failed S2T activities
    When I click label "Jira | Test"
    And I click label "run-1"
    And I see button "Cancel" is visible
    And I want to cancel a run
    When I click button "Cancel"
    Then I click "Stop Run" inside "cancel run modal"
    Then I see toast with "Run was canceled"

  Scenario: Make sure activities call does not has issues with a number only id
    When I click sidebar "Data Flows"
    Then I see text 'Simple River Logic Example'
    Given The logic river id contains numbers only
    Given I want to see Logic activities for river with numbers only id
    Then I click link 'Simple River Logic Example'
    Then I wait 4000
    Then I click button "activities"
    Then I see text "Simple River Logic Example Activity"
    Then I click link "run-0"
    And I see text "Logic Step" in table
    When I click text "Logic Step"
    Then I see dialog
    And I see text "Logic Step Log" in dialog
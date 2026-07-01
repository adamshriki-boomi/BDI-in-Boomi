Feature: Blueprint Source In Source-To-Target River

  # ─────────────────────────────────────────────────────────────────────────
  # Legacy blueprint (blueprint_type: "legacy") — global date_range, single
  # report. Source-tab is the canonical edit point for the date range; per-row
  # cell mirrors it.
  # ─────────────────────────────────────────────────────────────────────────

  Background:
    Given I want to create a source to target flow with a Blueprint

  Scenario: Legacy blueprint shows the Time Period picker in the source tab
    Given I have a legacy Blueprint available
    When I select the "Legacy GitHub Issues" Blueprint
    Then I see text "Date Range"
    And I see text "Standard"

  Scenario: Multi-report blueprint does not show the Time Period picker in the source tab
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    Then I see text "Standard"
    And I don't see text "Time Period"

  # ─────────────────────────────────────────────────────────────────────────
  # Bidirectional date_range sync (legacy) — source-tab ↔ grid row cell.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Setting the source-tab Date Range applies to a selected report row's date cell
    Given I have a legacy Blueprint available
    When I select the "Legacy GitHub Issues" Blueprint
    And I apply the Date Range picker in the source tab
    And I continue to the reports grid
    When I click label "select table ListIssues"
    Then I see text "incremental"

  Scenario: Setting a report row's date range reflects back on the source-tab
    Given I have a legacy Blueprint available
    When I select the "Legacy GitHub Issues" Blueprint
    And I continue to the reports grid
    When I click label "select table ListIssues"
    And I apply the Date Range picker on the "ListIssues" row
    And I return to the source step
    Then the source tab Date Range input is populated

  # ─────────────────────────────────────────────────────────────────────────
  # Multi-report grid behavior.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Multi-report grid renders per-report rows with their own date range cells
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    Then I see "ListPullRequests"
    And I see "ListIssues"
    And I see "ListOrganizationRepositories"
    And I see "ListCommits"

  Scenario: Per-row date range edits are independent in multi-report mode
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    When I click label "select table ListIssues"
    And I click label "select table ListCommits"
    And I remember the date range cell of "ListCommits"
    And I apply the Date Range picker on the "ListIssues" row
    Then the date range cell of "ListCommits" is unchanged

  # ─────────────────────────────────────────────────────────────────────────
  # Apply Changes button states inside the Table Settings drawer.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Apply Changes is enabled for a report with no required params
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    When I click label "select table ListOrganizationRepositories"
    And I open the table settings drawer for "ListOrganizationRepositories"
    Then I see button "Apply Changes" is enabled

  Scenario: Apply Changes is enabled when a required param has a declared default
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    When I click label "select table ListPullRequests"
    And I open the table settings drawer for "ListPullRequests"
    Then I see button "Apply Changes" is enabled

  Scenario: Apply Changes is disabled when a required param has no value and no default
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    When I click label "select table ListIssues"
    And I open the table settings drawer for "ListIssues"
    Then I see button "Apply Changes" is disabled

  Scenario: Editing date_range in the drawer applies on close and reflects in the grid (legacy)
    Given I have a legacy Blueprint available
    When I select the "Legacy GitHub Issues" Blueprint
    And I continue to the reports grid
    When I click label "select table ListIssues"
    And I open the table settings drawer for "ListIssues"
    And I apply the Date Range picker inside the drawer
    And I click "Apply Changes"
    Then I see text "incremental"

  Scenario: Reload Report Metadata with empty result shows a warning and stays on Source Settings
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    When I click label "select table ListIssues"
    And I open the table settings drawer for "ListIssues"
    And the reload report metadata pull request returns an empty result
    And I click "Table Source Settings"
    And I type "closed" to "state"
    And I click "Reload Report Metadata"
    Then I see text "Mapping retrieved no results. Check your configurations and try again."
    And I see text "Report Parameters"

  Scenario: Reload Report Metadata with non-empty result does not show the warning
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid
    When I click label "select table ListIssues"
    And I open the table settings drawer for "ListIssues"
    And the reload report metadata pull request returns columns
    And I click "Table Source Settings"
    And I type "closed" to "state"
    And I click "Reload Report Metadata"
    Then I don't see text "Mapping retrieved no results. Check your configurations and try again."

  # ─────────────────────────────────────────────────────────────────────────
  # Loading Mode column visibility per target type.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Storage target hides the Loading Mode column
    Given I have a multi-report Blueprint available
    When I select the "Multi-Report GitHub" Blueprint
    And I continue to the reports grid with an S3 target
    Then I don't see column "Loading Mode"


  # ─────────────────────────────────────────────────────────────────────────
  # Saved river — source-tab seeds from the saved row's date_range.
  # NOTE: requires a river fixture (rivers-list/blueprint/legacy.river.v1.json
  # + the legacy list response). Skipping the implementation until the river
  # fixture is in place; see blueprint.steps.ts for the empty step.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: New report selection in legacy picks up the current source-tab date_range
    Given I have a legacy Blueprint available
    When I select the "Legacy GitHub Issues" Blueprint
    And I apply the Date Range picker in the source tab
    And I continue to the reports grid
    When I click label "select table ListIssues"
    Then I see text "incremental"

  # ─────────────────────────────────────────────────────────────────────────
  # Date range persistence across tab navigation (legacy).
  # SelectRecipeDropdown re-runs onSelectBlueprint on remount; the user's
  # picked start/end must survive a full Source → Target → Schema → Source
  # round-trip.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Source-tab Date Range is preserved across tab navigation (legacy)
    Given I have a legacy Blueprint available
    When I select the "Legacy GitHub Issues" Blueprint
    And I apply the Date Range picker in the source tab
    And I remember the source tab Date Range value
    And I continue to the reports grid
    And I return to the source step
    Then the source tab Date Range matches the remembered value

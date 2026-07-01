Feature: Blueprint Edit & Test Flow

  # ─────────────────────────────────────────────────────────────────────────
  # Edit Blueprint drawer + Test Blueprint flow. The "Run Test" button in the
  # test panel renders only for blueprint_type === "legacy".
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Run Test button shows for legacy blueprints in the test panel
    Given I open the edit drawer for a legacy Blueprint
    When I click the Test Blueprint button
    Then I see button "Run Test"

  Scenario: Run Test button is hidden for multi-report blueprints in the test panel
    Given I open the edit drawer for a multi-report Blueprint
    When I click the Test Blueprint button
    Then I don't see button "Run Test"

  # ─────────────────────────────────────────────────────────────────────────
  # /validate error surfaces the backend `detail` in the toast.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Validate YAML error toast shows the backend detail string
    Given I open the edit drawer for a legacy Blueprint
    And the YAML validation endpoint returns an error
    When I click button "Validate"
    Then I see text "A 'date_range' interface parameter is not allowed in the global interface parameters of a multi-report Blueprint."

  # ─────────────────────────────────────────────────────────────────────────
  # Saving an edit that fails should NOT close the drawer.
  # ─────────────────────────────────────────────────────────────────────────

  Scenario: Edit drawer stays open when /recipes/files save fails
    Given I open the edit drawer for a legacy Blueprint
    And the blueprint file save endpoint returns an error
    When I click the Apply Changes button in the edit drawer
    Then the edit blueprint drawer is still open

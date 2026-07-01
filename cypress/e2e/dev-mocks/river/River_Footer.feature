Feature: River Footer
  As a data analyst, I want to to run, save and receive feedback for the currently viewed river, so I can get analytics for my company

  Scenario: Validate A River And Save
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    Given I want to save a river
    When I click button "Add Logic Step"
    When I click Save
    Then I see texts "Please make sure this step is valid"
    Then I see button "Save Anyway" is visible
    When I click Save Anyway
    Then I see button "Save Anyway" is disabled
    Then I see text "The data flow was saved successfully"

  Scenario: Run Invalid River
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    Given I want to run a river
    And I want to save a river
    When I click button "Run"
    Then I see "Something is not right"
    Then I see button "Save Anyway" is visible
    When I click button "Cancel"
    Then I see button "Run" is disabled

  Scenario: Save button is disabled when river is running and enabled when run completed
    Given I open a valid river
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    Given I want to run a valid river
    When I click button "Run"
    Then I see button "Save" is disabled
    When run has completed
    When river has started polling for result
    When river run has ended successfully
    When river has started polling for result
    Then I see "completed successfully"
    And I see button "Save" is enabled

  Scenario: Run Valid River
    Given I open a valid river
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    Given I want to run a valid river
    When I click button "Run"
    Then I see button "Cancel Run" is visible
    When run has completed
    And river has started polling for result
    Then I see button "Cancel Run" is visible
    When river has started polling for result
    Then I see "is waiting to run."
    When river check run is running
    Then I see "is now running."
    And river run has ended successfully
    Then I see "completed successfully"
    And I see button "Run"


  # Scenario: Show Logic Results Drawer
  #   Given I open a valid river
  #   When I navigate to a logic river
  #   And I wait for river mocks to complete loading
  #   Given I want to run a valid river
  #   Given I want to see logs for the river run
  #   When I click button "Run"
  #   When run has completed
  #   When river has started polling for result
  #   When river check run is running
  #   When I see button "View Run Details"
  #   Then I click button "View Run Details"
  #   When I see label "logs list"
  #   Then I see "Logs"
  #   When river run has ended successfully
  #   And river has started polling for result
  #   Then I see "completed successfully"
  #   Then I click button "close-results-panel"
  #   Then I don't see label "logs list"

  Scenario: Run River With a failing result
    Given I open a valid river
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    Given I want to run a valid river
    When I click button "Run"
    Then I see button "Cancel Run" is visible
    When river has started polling for result
    Then I see "is waiting to run."
    When river run has failed
    And river has started polling for result
    Then I see "'drop_table_dataset' with a very long text message that was failed"
    And I don't see "shown in the dialog only"
    And I see button "Run"

  # commented out - will be tested in automatuion.
  # Scenario: Run River, navigate away and view river again
  #   Given I open a valid river
  #   When I navigate to a logic river
  #   And I wait for river mocks to complete loading
  #   Given I want to run a valid river
  #   When I click button "Run"
  #   When the river save request is completed
  #   And run has completed
  #   # TODO validate river
  #   Then I see button "Cancel Run" is visible
  #   When river has started polling for result
  #   Then I see "is waiting to run."
  #   When I click sidebar "Dashboard"
  #   And I navigate to a logic river
  #   Then I see button "Run" is visible


  Scenario: Cancel Run River
    Given I open a valid river
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    Given I want to run a valid river
    When I click button "Run"
    And run has completed
    Then I see button "Cancel Run" is visible
    And I want to cancel a run
    When I click button "Cancel Run"
    Then I click "Cancel Run" inside "cancel run modal"
    When river run has ended successfully
    Then I wait for river run to be canceled
    Then I see button "Run" is visible

  Scenario: Display error message on save River
    Given I want to save a river with error
    When I navigate to a logic river
    When I click Save
    Then I see "Please make sure this container is valid"
    Then I see "Some steps are not valid. Are you sure you want to save this data flow?"
    Then I see button "Save Anyway" is visible
    When I click Save Anyway
    And the river save request is completed
    Then I see toast with "The notification run time"
# Then I see element "[role=\"status\"]"
# And I see text "Something went wrong. Nothing was done."

# Then I see dialog "Are you sure you want to cancel the river \"name of river\" run?"
# And river has started polling for result
# And I see text "Canceling run may stop the process in any stage. No rollback will be preformed."
# And I see text "RPU will be charged for any process that was already made."
# And I see button "No"
# And I see button "Yes"





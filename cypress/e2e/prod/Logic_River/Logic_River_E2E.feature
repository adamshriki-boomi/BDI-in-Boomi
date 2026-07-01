Feature: Logic River
  I want to make sure Logic River basic functionality is up and running

  Background:
    When I sign in as real admin to the app
    Given I want to test Logic River

  Scenario: I want to get validation error on save
    When I click button "Save"
    Then I see text "Something is not right"
    And I see button "Fix The Data Flow"
    When I click button "Fix The Data Flow"
    Then I don't see text "Something is not right"
    And I see text "Please make sure this step is valid"

  Scenario: I want to add a second step and then delete it
    When I click button "Add Logic Step"
    Then I see text "Logic step 1"
    When I click "Delete Step" menu item in "step Logic step 1 actions" menu
    Then I don't see text "Logic step 1"


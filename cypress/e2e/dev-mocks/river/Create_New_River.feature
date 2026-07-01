Feature: Create New River
  As a data analyst,
  I want to to create a new Logic river,
  So I can run my configuration.

  Background: User signs to the homepage
    When I click text "Create"
    Given I want to mock data sources

    Then I see label "Create data flow drawer"
    Then I see texts "Logic Flow" 2 times
    # Then I see texts "Action River" 3 times
    Then I see texts "Source to Target Flow" 2 times

  Scenario: Create New Logic River
    Then I see "Create Data Pipelines & Workflows"
    Then I see "Each type of Data Flow helps you accomplish different tasks."
    Given I have added a new Google BQ connection
    When I click link with aria-label "logic"
    Then I see texts "Untitled Data Flow" 2 times
    * I see Logic Icon
    * I see text "Logic Steps"
    * I see text "Drafted:"
    * I see text "ultimate guitars"
    Then I see button "Add Logic Step"
    * I see button "Run"
    * I see button "Save"
    * I see "Google BigQuery" in Target Select of "Logic Step"
    When I click button "group ultimate guitars"
    And I click button "cherry"
    Then I don't see text "ultimate guitars"
    When I click text "Create"
    When I click link with aria-label "logic"
    Then I see texts "Untitled Data Flow" 2 times
    Then I see text "ultimate guitars"

  Scenario: Switching Account/Env, displays new action rivers list
    Given I want to create an Action step
    When I click link with aria-label "logic"
    And I select Step Type "Action" of "Logic-Step"
    Then I see texts "Select REST Action"
    When I select "Alive Again" in Select action river of "Logic Step"
    Then I see "Alive Again" in Select data flow of "Logic Step"
    Given I want to select rivers from a different account
    Then I click button "Yes, leave data flow"
    When I click button "New Data Flow"
    When I click link with aria-label "logic"

    And I select Step Type "Action" of "Logic-Step"
    Then I see texts "Select REST Action"
    And I don't see "Alive Again" in Select data flow of "Logic Step"
    And I see text "City of Destruction"

  # Scenario: Create New River of type: Source to Target
  #   When I click link with aria-label "src_to_fz"
  #   Then I see empty river of "Source To Target" in old app

  Scenario: Create New River of type: Action
    When I click link with aria-label "actions"
    Then I see empty river of "Action" in old app

  Scenario: Save New Logic River get error
    Given I want to save a new river
    When I click link with aria-label "logic"
    Then I see texts "Untitled Data Flow" 2 times
    Then I see text "Drafted:"
    Given app is ready to test river page
    When I click Save
    Then I see text "Fix The Data Flow"


  Scenario: Clear Errors from a previous river
    Given I want to save a new river
    When I click link with aria-label "logic"
    Then I see texts "Untitled Data Flow" 2 times
    Then I see text "Drafted:"
    Given app is ready to test river page
    When I click Save
    Then I see button "Fix The Data Flow"
    Then I click button "Fix The Data Flow"
    When I click text "Create"
    Then I click link with aria-label "logic"
    Then I don't see button "Fix The Data Flow"
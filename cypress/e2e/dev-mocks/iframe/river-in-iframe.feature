Feature: River In Iframe
  Background:
    And I want to suppress errors
    Given I want to see rivers of all types
    Given I want to see old river in iframe
    When I click sidebar "Data Flows"

  Scenario: see sidebar
    When I click "s2t facebook"
    Then I see iframe "old-app"
    Then I see right sidebar


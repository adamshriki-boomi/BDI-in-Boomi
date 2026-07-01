Feature: River With Various Connections
  As a data analyst,
  I want to open a river with different connections,
  So I can create a complex river scenario that includes various connections

  Background:
    And I want to display a river with various connections
    And I want to test Snowflake connections
    And I want to test Azure Synapse Analytics connections
    When logic river page is displayed

  Scenario: Display File Zone list
    Then I see texts "Connections Optimization Testing 🧪" 2 times
    Then I see text 'Rivery Snowflake'
    Then I see text 'alice_in_chains'



Feature: Token Refresher
  As a data analyst
  I want to make changes to my river
  So I don't loose my work and my session is not expired

  Background:
    When logic river page is displayed
    When I click Target of "Logic step 1"
    When I select Target Type "Table" of "Logic step 1"

  Scenario: Keep session alive when session is expired
    Given I want to save a river when my session expired
    When I continue with my work after my session has expired
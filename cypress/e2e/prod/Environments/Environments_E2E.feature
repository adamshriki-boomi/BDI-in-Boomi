Feature: Environments
    I want to make sure Environments basic functionality is up and running

    Background:
        Given I want to test Environments visibility
    @skip
    Scenario: I see environments are loaded, and i can search and select
        Then I see texts "HR"
        And I see text "Digital Agency"
        Then I click force text "HR"
        When The selected environment has loaded
        Then I click label "environment account selector"
        Then I force type "stag" inside "search"
        Then I don't see text "Digital Agency"
        And I see text "Staging"

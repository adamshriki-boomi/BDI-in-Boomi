
Feature: Versioning and Restoring validation
    I want to test the versioning abilities when rivers change

    Background: Select the river
        When I click sidebar "Data Flows"
        Then I type "PG-to-BQ" inside "search-Data Flows"
        Then I click link "PG-to-BQ"

    @skip
    Scenario: I want to test river versioning

        Then I select tab "Schema"
        Then I see button "trading"
        Then I click button "trading"
        And I check 'select table members'
        And I check 'select table prices'
        Then I scroll to "Loading Mode"
        And I see texts "Upsert Merge" 2 times
        Then I click button "Bulk Actions"
        Then I click "All tables"
        And I click button "Next"
        And I click label "Set Loading Mode"
        When I select item "Overwrite" in list "actions.loadingMethod"
        And I click "Next"
        Then I click button "Apply Bulk Actions"
        And I see texts "Overwrite" 2 times
        Then I click button "versions"
        When I click label "select version" at index 1 on "bottomLeft"
        Then I click button "View Version"
        Then I wait 1000
        And I select tab "Schema"
        And I click button "trading"
        Then I see checkbox "select table members" is unchecked
        Then I see checkbox "select table prices" is unchecked
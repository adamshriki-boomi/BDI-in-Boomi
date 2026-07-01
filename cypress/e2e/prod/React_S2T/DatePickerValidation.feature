Feature: Date Picker UTC Validation
    I want to make sure the tables incerement is set and retrieved in UTC

    Background: Select the river
        When I click sidebar "Data Flows"
        Then I type "PG-to-BQ" inside "search-Data Flows"
        Then I click link "PG-to-BQ"
    @skip
    Scenario: I want to set a UTC time on an incremental table, and get it back
        Then I select tab "Schema"
        Then I click button "rivery"
        Then I click button "expand"
        Then I type "dor" inside "search tables"
        Then I wait 1000
        Then I select item "incremental" in list "select dordb extract method"
        Then I scroll "tables list" to the left
        Then I select item "tine" in list "select dordb incremental field"
        Then I wait 2000
        Then I scroll "tables list" to the left
        Then I wait 2000
        Then I click label "dordb timestamp"
        Then I clear input "time-slot-Start Date-0"
        Then I type "1" inside "time-slot-Start Date-0"
        Then I click button "Apply Changes"
        Then I click button "Save Changes"
        When text "Data Flow successfully saved" is visible
        # Then I wait 5000
        Then I scroll "tables list" to the left
        Then I click label "dordb timestamp"
        Then I see input "time-slot-Start Date-0" with value "1"
        Then I click button "Cancel"
        Then I select item "all" in list "select dordb extract method"
        Then I click "Save Changes"



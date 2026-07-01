Feature: Source To Target Data Flow - Run data flow
    Background:
        And I want to suppress errors
        Given I want to see rivers of all types
        When I click sidebar "Data Flows"
        Given I want to view source to target flow
        And I want to set MySql as a connection
        And I want to set Snowflake as a connection
        Then I see "s2t demo"
        When I navigate to Stt data flow
    @skip
    Scenario: run data flow
        Given I want to run new s2t data flow
        And I click button "Run Data Flow"
        Given Data Flow is set to run and pending
        Then I see button "Save Changes" is disabled
        And I see button "Stop Run"
        And I don't see button "Run Data Flow"
        And I see text "Data Flow is Waiting to Run"
        Given Data Flow is running
        Then I wait 2000
        Then I see button "Run Details"
        And I see button "View Activity"
        And I see text "Data Flow is Running"
        When I click button "Run Details"
        Then I see text "MySQL to Amazon S3"
        Given Data Flow has finished successfully
        Then I see text "Data Flow Run Completed Successfully"
        And I see button "download-log"
        And I see text "Done with warning"
        Then I click button "Run Details"
        And I don't see button "download-log"
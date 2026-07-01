
Feature: Postgres To Bigquery
    I want to test different S2T River scenarios

    Background: Select the river
        When I sign in as real admin to the app
        When I click label "environment account selector"
        Then I click force text "Production - Please Dont Touch"
        When The selected environment has loaded
        Then I click sidebar "Data Flows"
        Then I type "PG-to-BQ" inside "search-Data Flows"
        Then I click link "PG-to-BQ"

    # Scenario: I want to create source and target connections
    #     When I want to create a new source to target river
    #     Then I select "PostgreSQL" as the "Source"
    #     Then I want to create a new connection
    #     And I type "PostgreSQL-Test" inside "Connection Name"
    #     Then I type "postgresql.demo.rivery.in" inside "Host"
    #     Then I clear "Port"
    #     Then I type "5432" inside "Port"
    #     Then I type "sample" inside "Database"
    #     Then I type "postgres" inside "Username"
    #     Then I click button "Test Connection"

    Scenario: I want to view river activities and disable it
        Then I see switch "Activate Data Flow" is on
        Then I click label "Activate Data Flow"
        Then I see texts "Disable Data Flow"
        Then I click button "Disable Data Flow"
        Then I see text "Data Flow Disabling"
        When text "Data Flow Was Successfully Disabled!" is visible
        Then I click button "Close"
        Then I don't see text "Data Flow Disabling"
        And I see switch "Activate Data Flow" is off
        Then I select tab "Schema"
        Then I see button "Nast_DB"
        Then I click button "Nast_DB"
        Then I type "different_types" inside "search tables"
        Then I see label "select table different_types"
        Then I click label "select table different_types"
        Then I click button "Save Changes"
        Then I wait 500

    Scenario: I want to edit a river, activate and run it
        Then I select tab "Schema"
        Then I see button "Nast_DB"
        Then I click button "Nast_DB"
        Then I type "different_types" inside "search tables"
        Then I see label "select table different_types"
        Then I click label "select table different_types"
        Then I click button "Activate"
        When text "Data Flow Activation" is visible
        Then I see button "Cancel Activation"
        When button "Run Data Flow" is visible
        Then I see text "Data Flow Was Successfully Activated!"
        Then I see button "Run Data Flow"
        Then I click button "Run Data Flow"
        Then I don't see text "Data Flow Activation"
        When button "Stop Run" is visible
        Then I see input "Activate Data Flow" is disabled
        When text "Data Flow is running" is visible



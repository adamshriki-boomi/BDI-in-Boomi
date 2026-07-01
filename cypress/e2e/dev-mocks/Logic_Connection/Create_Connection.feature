Feature: Create Connection
  As a data analyst
  I want to create new connection
  So I could connect to new data source from Logic river

  Background:
    And I want to mock data sources
    When logic river page is displayed
    And I open new connection for Google BigQuery

  Scenario: Open New Connection Modal
    Then I see text "Google BigQuery Connection"
    Then I see labels:
      | label           |
      | Project Id      |
      | Test Connection |
    And I see button "Cancel"
    And I see button "Save"
    And I see text "Enter Connection details and credentials to add a new connection"
    And I see link "Read More"

  Scenario: Validate required fields before save
    Then I see text "Google BigQuery Connection"
    When I type "Connection From Test" to "Connection Name" at 1
    Then I click button "Save"
    Then I see text "Project Id is required"

# flaky test!
# Scenario: Save New Connection Modal
#   When I want to save a new connection
#   When I type "Connection From Test" to "Connection Name" at 1
#   When I type "1111" to "Project Id"
#   When I type "22" to "Port"
#   And I click button "Save"
#   Then the new connection is saved successfully
# And connections list is reloaded
# Then I don't see text "Google BigQuery Connection"

# Scenario: Open OAuth2 popup
#   When I want to open popup modal for oauth2
#   When I type "Connection From Test" to "Connection Name" at 1
#   When I click button "connect with google"
#   Given I want to see see success message for oauth2
#   Then I wait 3000
#   Then I see text "Connected with Google"

# Scenario: Open OAuth2 popup and get error message
#   When I want to open popup modal for oauth2 to get error
#   When I type "Connection From Test" to "Connection Name" at 1
#   When I click button "connect with google"
#   Then I wait 1000
#   Then I see text "error to display"
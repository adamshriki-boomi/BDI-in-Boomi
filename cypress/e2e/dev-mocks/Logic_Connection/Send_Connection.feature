Feature: Send Connection
  As a data analyst
  I want to share a connection url
  So I other users can create the same connection

  Scenario: Create a connection from Connection Link
    Given I want to create a connection from a url
    Given I want to save a new connection
    Then I navigate to shared connection url
    Then I see exact text "Creating a Connection"
    Then I see "Create Connection"
    When I click "Create Connection"
    Then I see text "Create Snowflake Connection"
    And I don't see button "Cancel"
    When I type "Username" to "Username"
    And I click button "Save"
    Then the new snowflake connection is saved successfully
    And I see text "Thank You!"

  Scenario: open expired share connection link
    Given I want to create a connection from a url
    Given I want to save a new connection
    Then I navigate to expired shared connection url
    And I see text "Please contact the person who shared this link and request a new one."

  Scenario: Send connection
    Given I want to mock Google BigQuery sources
    When logic river page is displayed
    And I open new connection for Google BigQuery
    And I want to send connection creation link to external user
    Then I see text "Missing Details?"
    Then I click button "Send External Link"
    And I see text "Add Connection By External User"
    And I see text "Send/Copy a unique link to create a connection by external user."
    And I see input "copy share link" with value "https://console.dev.rivery.in/#/?create_connection=fake"

    And I click button "copy link"
    Then I see "Copied to clipboard"

    Then I type "test@rivery.io" inside "email to"
    Then I click "Send"
    Then I see text "The email has been sent"




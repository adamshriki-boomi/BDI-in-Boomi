Feature: Script Editor Component
  As a data analyst, I want to be able to edit script,
  So I can run it with a river.

  Background:
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    When I click button "collapse Source Logic step 1"
    When editor for "Logic step 1" is ready

  Scenario: Basic display and append
    When I append text "\nappended line 1"
    Then Editor has content "select * from test\nselect name from members\nappended line 1"
    Then I see button "download SQL script"
    When I hover Step 'Logic step 1' SQL Expand Icon
    Then I see text "Expand & Preview Results"

  Scenario: Display new code that was written outside of modal in the script modal
    When I append text "\nappended line 1\nappended line 2"
    Then Editor has content "appended line 1\nappended line 2"
    When I click the Source SQL zoom icon of "Logic step 1"
    Then I see text "SQL Query - Logic step 1"
    Then Editor has modal content "select * from test\nselect name from members\nappended line 1\nappended line 2"

  Scenario: Source is not changed on cancel
    When I click the Source SQL zoom icon of "Logic step 1"
    When I append modal text "\nmodal text1\nmodal text22\n"
    When I "Cancel" modal editor

  Scenario: Source is changed on save
    When I click the Source SQL zoom icon of "Logic step 1"
    And I append modal text "\nmodal text1\nmodal text2\n"
    When I "Apply" modal editor
    Then Editor has content "select * from test\nselect name from members\nmodal text1\nmodal text2\n"

  Scenario: Display Errors for special characters in code
    When I append text ";"
    Then I see text "If you use a semicolon in a string, please use its HEX ASCII character"
    When I append text "--"
    Then I see text "Please make sure that comments syntax is"
    When I select option "SQL Script" of "Source Type Logic step 1"
    And I hover button "tooltip icon Tooltip SQL Script"
    Then I see texts "The SQL script is not encrypted in any way. Please avoid using credentials in the script."
    Then I see texts "The SQL script runs according to user configurations. Users are responsible for any changes to the table, schema, or data that occur due to the script."

  Scenario: Run results for an sql code with an error
    Given I want to test errors
    Given I run an sql query with an error
    When I click button "variables"
    Then I click force button "add variable"
    When I type "sql_testing" to "Variable Name"
    And I click button "Add"
    And I click button "Apply Changes"

    When I click the Source SQL zoom icon of "Logic step 1"
    Then I see texts "Results"
    Then I see text "Compiled SQL"
    Then I see text "#Rows:"
    Then I see text "#Columns:"
    Then I see Run Button
    When I append modal text "\nnew code{enter}"
    When I click Run
    Then I expect run results to include the "new code"
    Then I see text "results error for step \"Logic Step\":"

  Scenario: Run Results for an sql code that was added and removed
    Given I run an sql query with an error
    When I click button "variables"
    Then I click force button "add variable"
    When I type "sql_testing" to "Variable Name"
    And I click button "Add"
    And I click button "Apply Changes"
    When I click the Source SQL zoom icon of "Logic step 1"
    When I wait for editor to show up
    When I append modal text "ZZZ"
    Given I want to test errors
    When I click Run
    Then I expect run results to include the "ZZZ"
    Then I see text "results error for step"
    And I see text "View Logs"
    And I delete modal text 3 characters
    When I click Run
    Then I expect run results to not include the "ZZZ"

  Scenario: Run results for a sql code and display results and display error if run from compile
    Given I want to test errors
    Given I run a valid sql query
    When I click the Source SQL zoom icon of "Logic step 1"
    Then I see texts "Results"
    Then I see text "Compiled SQL"
    Then I see text "#Rows:"
    Then I see text "#Columns:"
    Then I see Run Button
    When I click Run
    And results are ready
    Then I see text "Lauri Wall"
    Then I see text "682 Dumont Avenue"
    Then I see text "#Rows: 20"
    Then I see text "#Columns: 10"
    Then I can scroll results
    When I click text "Compiled SQL"
    And I wait 2000
    Then Compiled SQL Code Editor has content "select * from compiled script"
    Given I run an sql query with an error
    When I click Run
    Then I see text "results error for step \"Logic Step\":"
    And I don't see text "Lauri Wall"

  Scenario: Run results for a sql code and display results with Limit
    Given I run a valid sql query with maximum amount of results
    When I click the Source SQL zoom icon of "Logic step 1"
    Then I see Run Button
    When I click Run
    And results are ready
    Then I see text "Alford Hines"
    Then I see text "#Rows: 1000"
    Then I see text "#Columns: 8"
    Then I see text "(Limited)"
    When I hover text "(Limited)"
    Then I see text "Results preview is limited to 1000 rows"

  Scenario: Display Run Results and clear results to run a failed result
    Given I run a valid sql query
    When I click the Source SQL zoom icon of "Logic step 1"
    When I click Run
    And results are ready
    Then I see text "Lauri Wall"
    Then I can scroll results
    Given I want to test errors
    Given I run an sql query with an error
    When I click Run
    Then I see text "results error for step \"Logic Step\":"
    And I don't see text "Lauri Wall"

  Scenario: Clear Error Results after closing a modal
    Given I want to test errors
    Given I run an sql query with an error
    When I click the Source SQL zoom icon of "Logic step 1"
    When I click Run
    Then I see text "results error for step \"Logic Step\":"
    When I click button "Cancel"
    And I click the Source SQL zoom icon of "Logic step 1"
    Then I don't see text "results error for step \"Logic Step\":"

  Scenario: Viewer role: see sql query in readonly without results
    When I switch to a viewer account
    Given I run a valid sql query
    When I navigate to a logic river
    And I wait for river mocks to complete loading
    When I click button "collapse Source Logic step 1"
    When I click the Source SQL zoom icon of "Logic step 1"
    Then I see button "Apply" is disabled in dialog
    And I don't see text "Results"

  Scenario: Display No Results message and I see compiled query
    Given I want to test errors
    Given I run a sql query without results
    When I click the Source SQL zoom icon of "Logic step 1"
    When I click Run
    And results are ready
    Then I see text "No results"
    Given I run an sql query with an error
    When I click Run
    When results are ready
    Then I see text "results error for step \"Logic Step\":"
    Then I see tab "Compiled SQL" is selected
    Then Compiled SQL Code Editor has content "select * from compiled script"

  Scenario: See tooltip for expand button and make sure its removed
    When I hover Step 'Logic step 1' SQL Expand Icon
    Then I see text "Expand & Preview Results"
    And I click the Source SQL zoom icon of "Logic step 1"
    Then I see Run Button
    When I click button "Cancel"
    Then I don't see text "Expand & Preview Results"
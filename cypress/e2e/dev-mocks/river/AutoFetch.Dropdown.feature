Feature: AutoFetch options from pulling
  As a data analyst
  I want to have dropdowns populated with server meta data

  Background:
    When logic river page is displayed

  Scenario: Get datasets results and filter them
    When I want fetch datasets to succeed
    When I click button "collapse Target Logic step 1"
    When I select option "Table" of "Target Type Logic step 1"
    When I open select "Dataset ID"
    Then I see "Dataset_f" inside "Dataset ID options list"
    When I clear type "J" to "Dataset ID options list"
    Then I see "Dataset_j" inside "Dataset ID options list"
    When I clear type "{{}new_var" to "Dataset ID options list"
    When I blur active input
    When I open select "Dataset ID"
    Then I don't see "{new_var" inside "Dataset ID"
    When I clear type "{{}new_var}" to "Dataset ID options list"
    When I blur active input
    Then I see select "Dataset ID" with "{new_var}"

  Scenario: Bad datasets results in response
    When I click button "collapse Target Logic step 1"
    When I want fetch datasets to fail
    When I select option "Table" of "Target Type Logic step 1"
    When I open select "Dataset ID"
    Then I see text "failed to connect to Snowflake. project: visionbi-cloud, dataset: all datasets. reason: argument should be a bytes-like object or ASCII string, not 'NoneType'"
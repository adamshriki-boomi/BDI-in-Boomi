Feature: Upload Credentials File
  As a data analyst
  I want to upload credential file
  So I could connect to BigQuery

  Background:
    Given I want to mock data sources
    When logic river page is displayed
    And I open new connection for Google BigQuery
    Then I see "Create Google BigQuery Connection"
    When I click "Custom File Zone"
    Then I scroll to element "Custom File Zone"

  Scenario: Display upload file input
    Then I see "Google BigQuery Connection"
    Then I see "Browse for a file"
    Then I see "Drag and drop your file.json here"

  Scenario: Upload file successfully
    Then I see "Drag and drop your file.json here"
    When I upload a json file to "Service Account Private key (JSON)"
    Then I see "uploaded successfully"
    Then I see "{key_files_path}/hash_path/gcloud/hash_example.json"

  Scenario: Upload invalid file
    Then I see "Drag and drop your file.json here"
    When I upload an invalid json file to "Service Account Private key (JSON)"
    And I scroll to 'Default Bucket'
    Then I see "File is not valid"

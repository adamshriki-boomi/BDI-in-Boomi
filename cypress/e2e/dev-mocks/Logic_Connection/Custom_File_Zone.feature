Feature: Custom File Zone
  As a data analyst
  I want to define my filezone
  So I could connect to BigQuery since Rivery doesn’t support custom filezone for those sources yet

  Background:
    When logic river page is displayed
    And I open new connection for Snowflake

  Scenario: Display File Zone list
    When I want fetch buckets to succeed
    Then I see label "Custom File Zone"
    Given I want to select a custom file zone
    When I switch "Custom File Zone"
    And file zone list has loaded
    When I select item "landing2" in list "FileZone Connection"
    Then I wait 1000
    Then I see select "Default Bucket" with "{aws_file_zone}"
    Then I select item "Bucket1" in list "Default Bucket"

# And I click button "Save"
# Then the new connection is saved successfully
# And connections list is reloaded

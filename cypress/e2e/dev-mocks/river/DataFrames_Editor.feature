Feature: DataFrames Editor
  As a data analyst
  I want manage DataFrames
  So I could use custom dataframe as an entity in Rivery

  Background:
    And I want to test data frames
    When logic river page is displayed

  Scenario: Edit DataFrames
    When I click button "dataframes"
    Then I see labels:
      | label                            |
      | toggle dataframe dataframe_1     |
      | toggle dataframe dataframe_2     |
      | toggle dataframe last_data_frame |
    Then I see labels:
      | label                        |
      | toggle dataframe dataframe_2 |
    Then I see text "DataFrames are flexible column-based, environment-wide data-structures." is visible
    When I click menu "toggle dataframe dataframe_1" and select "Delete"
    When I click button "Cancel"
    Then I see labels:
      | label                        |
      | toggle dataframe dataframe_1 |
    When I delete dataframe
    When I click "Delete" menu item in "toggle dataframe dataframe_1" menu
    When I click button "Delete"
    Then I see labels:
      | label                            |
      | toggle dataframe dataframe_2     |
      | toggle dataframe last_data_frame |
    Then I don't see labels:
      | label                        |
      | toggle dataframe dataframe_1 |

  Scenario: Display custom landing zone
    When I click button "dataframes"
    Then I see text "Custom Landing Zone"
    When custom landing zone names are ready
    Then I see text "s3 testing1" in table
    Then I see custom landing zones sorted as "s3 testing1, landing2"
    When I sort data frame table by 'Custom Landing Zone'
    Then I see custom landing zones sorted as "landing2, s3 testing1"

  Scenario: Add Simple DataFrame Without Custom Landing Zone
    When I click button "dataframes"
    When I add dataframe
    When I click button "new DataFrame"
    When I type "Fog" to label "Name"
    When I click button "Add"
    Then dataframe "Fog" has been added without landing zone

  Scenario: Prevent adding DataFrame when name is invalid
    When I click button "dataframes"
    When I add dataframe
    When I click button "new DataFrame"
    When I type "Rainier Fog" to label "Name"
    Then I see text "Dataframe name must contain only letters, digits or underscores"
    Then I see button "Add" is disabled in dialog
    When I clear type "dataframe_1" to "Name"
    Then I see text "DataFrame exists already"

  Scenario: Add DataFrame With Custom Landing Zone
    When I click button "dataframes"
    When I add dataframe
    When I click button "new DataFrame"
    When I type "Rainier" to label "Name"
    When I switch "Use Custom Landing Zone"
    And I select item 'Amazon S3' in list "Cloud Storage Type"
    When I select item 'landing2' in list "Select Landing Zone Connection"
    Then I see label "Default Bucket" is visible
    Then I see select with "{aws_file_zone}"
    When I click button "Add"
    Then dataframe "Rainier" has been added
    Then I don't see button "Add"

  Scenario: Display errors when adding DataFrame
    When I click button "dataframes"
    When I add dataframe
    When I click button "new DataFrame"
    When I type "dataframe_1" to label "Name"
    Then I see text "DataFrame exists already"
    When I type "1111" to label "Name"
    Given I want to test error in adding a dataframe
    When I click button "Add"
    Then dataframe add has been failed
    Then I see toast with "Dataframe Shadow_of_the_hieriphant already exist"


  Scenario: Edit DataFrame With Custom Landing Zone
    When I click button "dataframes"
    Given I want to edit a dataframe
    When custom landing zone names are ready
    When I click "Edit" menu item in "toggle dataframe dataframe_1" menu
    Then I see button "Update"
    Then I see text "s3 testing1" in "Update DataFrame" dialog
    When I select item 'Flashtalking' in list "Select Landing Zone Connection"
    Then I see label "Default Bucket" is visible
    Then I see select with "{aws_file_zone}"
    And I click button "Update"
    Then dataframe "dataframe_1" has been updated with landing zone "flashtalking"
    Then I don't see button "Update"

  Scenario: Edit DataFrame Without Custom Landing Zone
    When I click button "dataframes"
    Given I want to edit a dataframe
    When I click text "last_data_frame"
    Then I see button "Update"
    Then I wait 500
    Then I see text "Update DataFrame" is visible
    Then I see switch "Use Custom Landing Zone" is off
    When I switch "Use Custom Landing Zone"
    Then I see label "Cloud Storage Type"
    When I select item 'Amazon S3' in list "Cloud Storage Type"
    When I select item 's3 testing1' in list "Select Landing Zone Connection"
    Then I see label "Default Bucket" is visible
    Then I see select with "{aws_file_zone}"
    And I click button "Update"
    Then dataframe "last_data_frame" has been updated with landing zone "s3-testing1"
    Then I don't see button "Update"

  Scenario: Edit DataFrame Without Custom Landing Zone and save
    When I click button "dataframes"
    Given I want to edit a dataframe
    When I click text "dataframe_2"
    Then I wait 500
    Then I see button "Update"
    When I click "Use Custom Landing Zone"
    Then I see switch "Use Custom Landing Zone" is off
    When I click button "Update"
    Then dataframe "dataframe_2" has been updated without landing zone

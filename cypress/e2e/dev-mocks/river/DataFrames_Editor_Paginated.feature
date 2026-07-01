Feature: DataFrames Editor
  As a data analyst
  I want manage DataFrames
  So I could use custom dataframe as an entity in Rivery

  Background:
    Given there are multiple dataframes
    Given I am signed in as fake user to the app without dataframes
    When logic river page is displayed

  Scenario: See all dataframes from paginated response
    When I click button "dataframes"
    Then I see "dataframe_1"
    Then I see "dataframe_2"
    Then I see "last_data_frame"
    Then I see "last_frame_2"
    Then I see "last_frame_3"


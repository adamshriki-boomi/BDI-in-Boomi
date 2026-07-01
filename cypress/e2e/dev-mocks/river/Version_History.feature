Feature: Version History
  As a data analyst
  I want to view the versions of my rivers
  So I could view and edit a river according to previous versions

  Background:
    And I want to review versions
    When logic river page is displayed
    When I see button "versions" is visible
    And I click button "versions"
    And versions have been loaded successfully
    Then I hover button "close versions"
  #removing the focus from what are versions tooltip

  Scenario: Review version history details
    Then I see label "version history"
    And I see text "Only show bookmarked versions"
    And I see texts "Jul 14"
    # make sure the format is a local date
    And I see text ":48 PM"
    And I see text "Nmb"
    And I see button "bookmark version" in place 1
    And I see texts "ago"

  # As a data analyst
  # I want to understand what is a version
  # So I could use this feature effectively
  # User see information about this feature and have the option to open documentation for more info
  Scenario: What is versions - tooltip / explanation
    Then I wait 400
    Then I hover button "tooltip icon Version History Help"
    Then I wait 1000
    #We have a timeout before displaying the tooltip
    Then I see text "What Are Versions?"

  #   Scenario: Save version automatically
  #   '''
  #   As a data analyst
  #   I want to save a version
  #   So I could go back to the history according to event that happened with my River


  #   Versions are created automated by a list of events
  #   Creating a version should be triggered by a specific list of events
  #   Improvement to consider later - manual save of versions
  #   '''

  #   As a data analyst
  #   I want to bookmark a version
  #   So I could easily identify in my “favorite” versions

  Scenario: Bookmark version
    When I click button "bookmark version" in place 2
    Then version is bookmarked

  #   User can add a Bookmark to a version
  #   Counter of number of versions is updated

  #   √ Limited to 70 bookmarks
  #   Issue with Bookmark vs Favorite icon - ? (and Kits)
  #   Show counter
  #   '''


  #   As a data analyst
  #   I want to un-bookmark a version
  #   So I could easily remove a version in my “favorite” versions

  Scenario: Un-bookmark version
    When I click button "bookmark" in place 1
    Then version is not bookmarked

  #   User can add a un-Bookmark to a version
  #   Counter of number of versions is updated
  #   '''

  #   As a data analyst
  #   I want to view only my bookmark versions
  #   So I could easily see all my “favorite” versions

  Scenario: Show only bookmark versions
    When I switch "Only show bookmarked versions"
    Then I don't see text "Jun 27"
    And I don't see text "Soen Lascivious"

  #   User clicks on a button and only bookmark versions are visible.
  #   Another click on the button and all versions are visible
  #   Checkbox or toggle?
  #   Rename - “Display” => “Show”
  #   '''


  #   As a data analyst
  #   I want to view a specific version
  #   So I could view, validate & understand all it’s details

  Scenario: View older version
    When I click label "select version" at index 3 on "bottomLeft"
    Then I see text "Any unsaved changes will be lost"
    And I see button "View Version"
    And I click button "View Version"
    # And I see text "Any unsaved changes will be lost" in dialog
    And version has loaded
    Then I see button "Restore Version"
    Then I see button "Back to Current"
    # assert view mode
    Then I see button "Save" is disabled
    Then I see button "Run" is disabled
    Then I see button "Add Logic Step" is disabled
    # Then I wait 100000

    When I see menu "Logic Step add container" item "Run Once" is disabled
    And I click button "Back to Current"
    Then I click button "versions"
    And I see latest version is selected


  #   As a data analyst
  #   I want to set and restore my river to a specific version
  #   So I could return to an specific state
  Scenario: Restore version
    When I click label "select version" at index 3 on "bottomLeft"
    And I click button "View Version"
    And version has loaded
    When I click button "Restore Version"
    And version has been restored successfully
    # versions are fetched again
    # And versions have been loaded successfully
    Then I don't see button "Restore Version"
    Then I see texts "The Restored River 🦄"

  Scenario: Cancel restore version mode
    When I click label "select version" at index 3 on "bottomLeft"
    And I click button "View Version"
    And version has loaded
    When I click button "Back to Current"
    Then I don't see button "Restore Version"

  #   As a data analyst
  #   I want to exit from the view mode of a version
  #   So I could return to my active version

  Scenario: Exit older version
    When I click label "select version" at index 3 on "bottomLeft"
    And I click button "View Version"
    And version has loaded
    Then I see button "Restore Version"
    Then I see texts "OREN's River 🦄"
    When I click button "Back to Current"
    Then I don't see button "Restore Version"
    Then I see texts "Simple River Logic Example"

  #   As a data analyst
  #   I want to set a name to a version
  #   So I could identify my versions easily according to specific business scenario

  Scenario: Set name to version
    When I click button "edit text Jul 14" in place 1
    When I type to version "👑 unicorns rule 🦄 the universe" in place 1
    And I click "Latest Version"
    And I click button "versions"
    Then version name is updated
    # And versions have been loaded successfully
    And version is bookmarked

  #   # PHASE 2 Scenario: Version description
  #   # '''
  #   # As a data analyst
  #   # I want to set a description to a version
  #   # So I could identify my versions easily according to specific descriptive business scenario


  #   # Like a commit - add description what was changed in the version
  #   # '''

  # As a data analyst
  # I want to view how many versions do I have
  # So I could understand my version history statistics

  Scenario: Versions counters
    And I see text "4" within "version history" widget
    And I see text "1" within "version history" widget
    When I hover text "4"
    Then I see text "4 versions, limited to 100 versions per data flow."
    When I hover text "1"
    Then I see text "1 bookmarked versions, limited to 30 versions per data flow."

  # If limit achieved - we are overriding the version
  # '''


  Scenario: Open a version directly from url
    When I click label "select version" at index 3 on "bottomLeft"
    And I click button "View Version"
    And version has loaded
    Then I see button "Restore Version" is enabled
    When I reload the page
    # And page has reloaded
    # And versions have been loaded successfully
    # Then I see label "version history"
    # Then I see "Restore Version"
    Then I wait for river mocks to complete loading
    Then I see button "Restore Version" is visible

# Scenario: View sql script of previous version
#   When I click label "select version" at index 3 on "bottomLeft"
#   And I click button "View Version"
#   And version has loaded
#   When I click Source of "Logic Step"
#   And I click the Source SQL zoom icon of "Logic Step"
#   Then I see tabs "Results, Compiled SQL"
#   Then I see button "Run" is enabled
#   Then I see button "Apply" is disabled in dialog
#   When I click button "close"
#   And I click Step "Logic Step" sql icon
#   Then I see tabs "Results, Compiled SQL"
#   Then I see button "Run" is enabled
#   Then I see button "Apply" is disabled in dialog
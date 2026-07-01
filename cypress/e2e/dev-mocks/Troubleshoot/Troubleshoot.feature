Feature: AI Troubleshoot
  As a user
  I want to use AI troubleshooting on failed activities
  So I can quickly diagnose and fix issues

  Scenario: AI toggle is off - no Help Me Fix It, banner prompts to enable
    Given I am signed in as admin with AI disabled
    When I click button "Settings"
    When I click menu button "Account Settings"
    Then I see tab "General" is selected
    Then I wait 500
    Then I see text "Enable AI Features"
    Then I see switch "Enable AI Features" is off
    Given I set up troubleshoot activities
    When I click sidebar "Activities"
    When troubleshoot activities have loaded
    Then I see text "Jira | Test"
    Given I set up the failed S2T run
    When I click label "Jira | Test"
    And I click label "run-1"
    Then I see text "failed"
    Then I don't see text "Help Me Fix It"
    When I click cell text "rivery_demo.dwh.fb_ads_ads"
    Then I see text "Smarter Troubleshooting with AI"
    Then I see texts "Enable AI"
    When I click text "Enable AI"
    Then I see tab "General" is selected
    Then I see texts "AI Features"
    Then I see switch "Enable AI Features" is off

  Scenario: Non-admin sees disabled enable button in banner
    Given I am signed in as non-admin with AI disabled
    Given I set up troubleshoot activities
    When I click sidebar "Activities"
    When troubleshoot activities have loaded
    Then I see text "Jira | Test"
    Given I set up the failed S2T run
    When I click label "Jira | Test"
    And I click label "run-1"
    Then I see text "failed"
    When I click cell text "rivery_demo.dwh.fb_ads_ads"
    Then I see text "Smarter Troubleshooting with AI"
    Then I see button "Enable AI" is disabled

  Scenario: AI on - click Help Me Fix It from drawer opens AI drawer
    Given I am signed in as admin with AI enabled
    Given I navigate to failed S2T run
    Then I see text "Help Me Fix It"
    When I click cell text "rivery_demo.dwh.fb_ads_ads"
    Then I see text "Help Me Fix It"
    When I click force text "Help Me Fix It"
    Then I see text "Boomi Data Integration's AI-powered troubleshooting tool"

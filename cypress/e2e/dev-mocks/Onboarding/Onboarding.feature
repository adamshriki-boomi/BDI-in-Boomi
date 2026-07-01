Feature: Onboarding
    As a user
    I want to see the onboarding screen

    Background:
        Given I am signed in as fake user to the app
        Given I want to see the onboarding page
        And I want to suppress errors
        When I see text "Help" within "sidebar"
        Then I click "Help" in sidebar
        Then I click visible label "get started"

    Scenario: I see the onboarding steps and their content
        Then I see text "Welcome Aboard, John Doe"
        And I see text "0 Steps Completed"
        And I see text "Get to know us"
        And I see text "Setup your data connections"
        And I see texts "Create your first data flow"
        And I see text "Transform and orchestrate your data using SQL and Python"
        And I see text "Get a head start with pre-built solutions"
        And I see text "Invite a team member to join"

    Scenario: I view and update step one
        And I click text "Get to know us"
        Then I see text "Learn how to smoothly sail across the Platform"
        Given I want to update "step1" with substep "onboarding_rivery_introduction"
        And I see button "Watch Video"
        When I click button "Watch Video"
        Then I see dialog
        Then I wait 2000
        When I click button "close"
        Then I don't see dialog
        Given I want to update "step1" with substep "onboarding_river_types"
        Then I click text "Understanding Data Flow Types"
        Then I see text "1 Steps Completed"

    Scenario: I view step two and navigate to create connection
        And I click text "Setup your data connections"
        Then I see text "Create connections to your data sources and data targets."
        And I see button "Add Connection"
        When I click button "Add Connection"
        Then I see in url "connections"

    Scenario: I view step three and navigate to s2t pipeline page
        And I click text "Create your first data flow"
        Then I see text "Extract your data from your source to target destination"
        And I see button "Create Your First Data Flow"
        When I click button "Create Your First Data Flow"
        Then I see in url "river"

    Scenario:  I view step three and navigate to activities page
        And I click text "Create your first data flow"
        Then I see text "Monitor your data flow"
        Then I click text "Monitor your data flow"
        And I see button "Visit Activities"
        When I click button "Visit Activities"
        Then I see in url "activities"

    Scenario: I view step four and navigate to relevant pages
        And I click text "Transform and orchestrate your data using SQL and Python"
        Given I want to update "step4" with substep "onboarding_logic_river"
        Then I see text "What is a Logic Flow"
        And I see button "Watch Video"
        When I click button "Watch Video"
        Then I see dialog
        Then I wait 2000
        When I click button "close"
        Then I don't see dialog
        Then I click text "Transform your data using SQL"
        Then I see button "Create Your First Logic Flow"
        Then I click button "Create Your First Logic Flow"
        Then I wait 2000
        Then I see in url "rivers"
        Then I click text "Help"
        Then I click label "get started"
        Then I click button "Yes, leave data flow"
        Given I want to update "step4" with substep "onboarding_use_python"
        And I click text "Transform and orchestrate your data using SQL and Python"
        Then I click text "Use Python transformations for maximum flexibility"
        Then I see button "Watch Video"
        Then I click button "Watch Video"
        Then I see dialog
        Then I wait 2000
        When I click button "close"
        Then I don't see dialog
    Scenario: I view step five and update the onboarding data
        When I click button "expand"
        Given I want to update "step5" with substep "onboarding_kits"
        And I click text "Get a head start with pre-built solutions"
        Then I see label "KitsVideo"
        When I click label "KitsVideo"
        Then I see dialog
        Then I wait 2000
        When I click button "close"
        Then I don't see dialog
        Then I see text "2 Steps Completed"

    Scenario: I view step six and update onboarding data
        Given I want to add a new user
        Given I want to update "step6" with substep "onboarding_invite"
        And I click text "Invite a team member to join"
        Then I see text "Start inviting your teammates to join your account -"
        And I see button "Invite"
        Then I type "Luke Skywalker" to "Full Name"
        And I type "luke@skywalker.io" to label "Email Address"
        Then I click "Invite"
        Then I see text "You’ve invited luke@skywalker.io to join Data Integration platform"
        And I see text "1 Steps Completed"

    Scenario: I can see Level up drawers
        Then I see "Leveling Up" exact
        When I click button "Deploy and manage your environments"
        Then I see dialog
        And I see texts "Deploy and manage your environments"
        And I see button "Create Environment"
        When I click button "Create Environment"
        Then I see in url "environments"
        Then I click text "Help"
        When I see button "get started"
        Then I click label "get started"
        When I click button "Connect to anywhere using REST API"
        Then I click button "Create REST Action"
        Then I see in url "type=actions"
        Then I click text "Help"
        When I see button "get started"
        Then I click label "get started"
        Then I see "Activate your data with Reverse ETL" exact
        Then I click button "Activate your data with Reverse ETL"
        Then I see dialog
        And I see label "Reverse_ETL"
        And I click label "Reverse_ETL"
        Then I see dialog
        Then I wait 2000
        Then I click button "close"

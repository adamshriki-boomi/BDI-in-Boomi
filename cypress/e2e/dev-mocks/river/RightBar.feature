Feature: Rivers Right Side Bar
    As a data analyst
    I want to be able to use river right bar in legacy rivers as well

    Scenario: Make sure no variables exist when creating a new river
        When logic river page is displayed
        Then I click button "variables"
        And I see label "variables editor"
        And I see text "{kids}"
        When I click label "Create"
        And I click link with aria-label "src_to_fz"
        Then I click button "Yes, leave data flow"
        When I see 'integrations'
        Then I type 'mysql' to 'search'
        Given I want to set MySql as a connection
        Then I click 'MySQL'
        And I click button "variables"
        And I don't see text "{kids}"

    Scenario: new river variables stayed when open drawer again:
        When I click label "Create"
        And I click link with aria-label "src_to_fz"
        When I see 'integrations'
        Then I type 'mysql' to 'search'
        Given I want to set MySql as a connection
        Then I click 'MySQL'
        And I click button "variables"
        When I click button "add variable"
        And I type "test_NEW" inside "Variable Name"
        And I click button "Add"
        Then I see text "test_NEW"
        When I click button "Apply Changes"
        Then I don't see text "test_NEW"
        When I click button "variables"
        Then I see text "test_NEW"

    Scenario: no variables drawer in action river
        When I click label "Create"
        And I click link with aria-label "actions"
        Then I see iframe "old-app"
        And I don't see button "variables"


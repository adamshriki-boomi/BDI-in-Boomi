Feature: Deployments
    As an admin,
    I want to manage my Deployments
    So I can have complete control over it

    Background:
        Given I want to see my deployments and activities
        When I click "Deployments" menu item in "Environments" menu

    Scenario: View packages grid and edit in drawer
        Then I see text "Test1"
        And I see text "Test2"
        And I see text "Test3"
        When I type "3" inside "packages.package_name"
        Then I don't see text "Test1"
        When I click button "Test3"
        And I wait for dialog to load
        Then I see texts "Package ID"
        And I see text "60c6ffc856d9ee3ec80daceb"
        Then I see text "Edit Package" in dialog
        And I see label "Package name"
        And I see button "save changes" is disabled
        When I type "123" inside "Package name"
        Then I see button "save changes" is enabled
        And I click button "save changes"
        And I wait for dialog to load
        Then I don't see dialog
        And I see toast with "Package has been saved"
        When I click button "Test3"
        And I click button "deploy-package"
        And I wait for dialog to load
        Then I see text "Package was configured." in dialog

    Scenario: Add new package
        When I click button "add package"
        And I wait for dialog to load
        Then I see text "Add Package" in "Add Package" dialog
        And I see button "back" is disabled
        And I see button "next" is disabled
        When I type "@#$%$" inside "Package name"
        Then I see text "Special characters are not allowed in Package Name"
        When I clear "Package name"
        And I type "package1" inside "Package name"
        Then I select item "Default" in list "env_id_src.$oid"
        And I select item "Faked Env 3" in list "env_id_trg.$oid"
        Then I see button "next" is enabled
        And I click button "next"
        # Then I see tabs "rivers, connections, variables, groups, kits" within dialog
        Then I see button "next" is disabled
        And I see button "back" is enabled
        Then I click label "entities-rivers-multicheck"
        Then I see button "next" is enabled
        And I see text "(20 of 957)" in dialog
        And I select tab "Settings"
        And I see button "next" is enabled
        Then I click button "next"
        And I wait for dialog to load
        Then I see text "Congrats!" in dialog

    Scenario: Save new package without preparing
        When I click button "add package"
        And I wait for dialog to load
        And I type "StarOne" inside "Package name"
        Then I select item "Default" in list "env_id_src.$oid"
        Then I select item "Faked Env 3" in list "env_id_trg.$oid"
        And I click button "next"
        Then I click label "entities-rivers-multicheck"
        And I click button "Cancel"
        And I see text "Exit Package Creation?" in dialog
        When I click button "Save & Exit"
        And I see toast with "Package has been saved"

    Scenario: Leave package set up without saving
        When I click button "add package"
        Then I select item "Default" in list "env_id_src.$oid"
        Then I select item "Faked Env 2" in list "env_id_trg.$oid"
        When list has completed loading
        And I type "StarOne" inside "Package name"
        When I click button "next"
        And I click label "entities-rivers-multicheck"
        When I click button "Cancel"
        Then I see text "Exit Package Creation?" in dialog
        When I click button "Exit Without Saving"

        Then I don't see dialog
        And I see toast with "Package set up has been canceled"

    Scenario: View Deployment Activities in view mode
        When I click label "activity-button"
        Then I see labels:
            | activity.package_name |
        When I type "om" inside "activity.package_name"
        Then I don't see text 'Shiran1'
        Then I click button "Clear"
        Then I select item "Reverted" in list "package_status"
        And I don't see text "Deployed successfully"
        Then I click button "Clear"
        Then I select item "Failed to revert" in list "package_status"
        And I don't see text "Reverted successfully"
        Then I see text "Failed revert"
        When I click button "Failed revert"
        Then I see texts "Package ID"
        Then I see text "62b5d056654af20012ae137d"
        And I see text "Deployment ID"
        And I see text "62b5d074c796ee00131c1a7d"

    Scenario: Show Environments menu for admins and deployment manager
        Given I am signed in as deployment manager
        Then I see button "Environments"
        Then I click button "Environments"
        Then I see link "Deployments"
        Then I click link "Deployments"
        Then I don't see text "Environment Manager"

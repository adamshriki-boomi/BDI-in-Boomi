Feature: Variables Manager
    As an admin,
    I want to manage my Variables
    So I can have complete control over it

    Background:
        When I click "Variables" menu item in "Environments" menu
        When I select tab "Variables"

    Scenario: Variables Grid view and edit
        Given I want to save update a variable
        And I see text "BLOCK_DB" within "all variables"
        And I see text "DATASET_NAME" within "all variables"
        And I see text "db_name" within "all variables"
        Then I select item "Dev" in list "environments"
        Then I don't see text "Faked Env 2" within "all variables"
        Then I click button "Clear"
        And I see text "Faked Env 2" within "all variables"

        Then I select item "aws_file_zone" in list "variables"

        Then I select tab "Variables"
        And I don't see text "SOLUTIONS"
        When I click button "Clear"
        Then I see text "SOLUTIONS"
        Then I select item "Dev" in list "environments"
        And I select item "source_bucket" in list "variables"
        Then I select tab "Variables"
        And I don't see text "gcs_file_zone"
        Then I click text "landing_zone_sample_data"
        And I type "1234" inside "edit name landing_zone_sample_data"
        Then I select tab "Variables"
        And I see text "landing_zone_sample_data"


    Scenario: Delete variable
        When I click button "menu-aws_file_zone"
        Then I click menu button "Delete"
        Then I see confirmation dialog with title 'Delete "aws_file_zone" Variable?'
        And I see text "The variable will be removed from all environments." in dialog
        Given I want to delete a variable
        Then I click button "Delete"
        And I see toast with "The variable has been deleted successfully"
        And I don't see confirmation dialog

    Scenario: "Add variable"
        When I click button "add variable"
        Then I see dialog

        Then I type "$#!!" inside "Variable Name"
        Then I see text "Name must contain only letters, digits or underscores and begin with a letter" in dialog
        Then I clear "Variable Name"

        Then I type "days_ago" inside "Variable Name"
        Then I see text "This variable name is already in use. Consider a different one." in dialog
        Then I clear "Variable Name"

        And I type "variable123" inside "Variable Name"
        Given I see text "Dev" in "Add Variable" dialog
        And I switch invisible label "Dev"
        When I type "fake" inside "search"
        Then I don't see text "Dev" in dialog
        Given I want to add a new variable
        And I want to test errors
        When I click button "Add Variable"
        And adding variable has completed
        Then I don't see dialog

    Scenario: Edit variables in drawer
        Given I want to update a variable in dedicated drawer
        When I click "Edit" menu item in "menu-aws_file_zone" menu
        Then I see dialog
        And I see text "Edit Variable" in dialog
        And I see labels:
            | Variable Name                  |
            | selected environment variables |
        Then I clear type "1234" to "values.faked-env-1"
        And I click button "Apply Changes"
        Given I want to see my updated variable
        Then I don't see dialog
        Then I see toast with "Variable was successfully edited"




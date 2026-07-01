#
#Feature: Deployments validation
#    I want to test the the environments deployments
#
#    Background:
#
#    Scenario: I want to test river versioning
#        Then  I click sidebar "Data Flows"
#        When I click label "environment account selector"
#        Then I click force text "HR"
#        When The selected environment has loaded
#        # checking the environment is clean
#        Then  I click sidebar "Data Flows"
#        Then I don't see river with name "old_api_cdc"
#        # running a deployment
#        Then I click "Deployments" menu item in "Environments" menu
#        When I click button "add package"
#        Then I select item "Production - Please Dont Touch" in list "env_id_src.$oid"
#        And I select item "HR" in list "env_id_trg.$oid"
#        Then I wait for input "Package name" and type "Morzus"
#        Then I click button "next"
##        And I check "river list old_api_cdc"
#        Then I click label "river list old_api_cdc"
#        Then I click button "next"
#        Then I scroll to "Add Credentials to Connections"
#        Then I click text "Add Credentials to Connections"
#        Then I click button "next"
#        And I click button "deploy-package"
#        Then I see text "Deploying"
#        When text "Deploying" is not visible
#        # testing that the deployment was successful
#        Then  I click sidebar "Data Flows"
#        Then I see river with name "old_api_cdc"
#        # reverting the deployment
#        Then I click "Deployments" menu item in "Environments" menu
#        Then I click text "activity"
#        Then I see button "Revert"
#        Then I click button "Revert"
#        And I wait 500
#        Then I click button "Revert"
#        Then I see text "Reverting"
#        # checking that the river was reverted
#        When text "Reverting" is not visible
#        Then I click sidebar "Data Flows"
#        Then I don't see river with name "old_api_cdc"
#        # delete the package
#        Then I click "Deployments" menu item in "Environments" menu
#        Then I click "Delete" menu item in "package-actions" menu
#        Then I click button "Delete"
#        Then I see text "Not even a single Deployment Package to show"

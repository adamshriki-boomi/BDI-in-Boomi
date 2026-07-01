Feature: Variables Page
    As a user I would like to see all my environment variables,
    be able to add a new one, edit an existing one, and delete.
    Background:
        And I want to see Variables Table

    Scenario: I see variables table and variables drawer
        When I see label 'variables table'
        Then I click button 'add variable'
        Then I see dialog
        And I click button "Cancel"
        Then I don't see dialog
        When I click button "aws_file_zone"
        Then I see dialog

    Scenario: I can add new variable
        Given I want to add a new variable
        When I click button 'add variable'
        Then I see labels:
            | Variable Name |
            | value         |
        And I see button "Add Variable" is disabled
        And I type "aws_file_zone" to label "Variable Name"
        Then I see text 'This variable name is already in use. Consider a different one.'
        Then I type "!!" to label "Variable Name"
        And I see text 'Name must contain only letters, digits or underscores and begin with a letter'
        Then I clear "Variable Name"
        Then I write "variable123" to "Variable Name"
        And I see button "Add Variable" is enabled
        Given I want to add a specific new variable
        Given I am about to click Add Variable
        When I click button "Add Variable"
        And Update environments operation completes
        Then I see toast with "Variable variable123 was Added"
        And I don't see dialog
    # And I see text "variable123" in table

    Scenario: I can edit existing variable value
        Given I want to edit an existing variable
        When I click button "aws_file_zone"
        Then I see input "Variable Name" is disabled
        And I see button "Apply Changes"
        And I see input "value" with value ""
        Then I type "1234" to "value"
        Given I get back updated variables
        And I click button "Apply Changes"
        And Update environments operation completes
        And I see toast with "Variable aws_file_zone was Updated"
        Then I don't see dialog
    # And I see text "1234" in table

    Scenario: I can delete variable
        Given I see text "aws_file_zone" is visible
        And I want to delete an existing variable
        And I want to delete variable "aws_file_zone"
        When I click button "aws_file_zone-actions"
        Then I click menu button "Delete"
        Then I see confirmation dialog with title 'Delete "aws_file_zone" Variable?'
        Then I click button 'Delete'
        Then I see the "aws_file_zone" variable in the delete request
        And I see toast with "Variable aws_file_zone was deleted"
        And I don't see button "aws_file_zone-actions"



Feature: SSH Input
  As a data analyst
  I want to edit SSH Options for an Azure SQL connection
  So I could redefine a secured connection details

  Background:
    When logic river page is displayed
    And I open new connection for Azure Synapse Analytics

  Scenario: Display SSH Options Editor
    Then I see switch "Custom File Zone" is off
    Then I see switch "SSH Tunnel" is off
    Then I wait 500
    When I toggle switch with label "SSH Tunnel"
    Then I see labels:
      | label                |
      | SSH Port             |
      | SSH Hostname         |
      | SSH Remote User Name |
    And I see text "SSH Credentials"
    And I see text "Upload PEM"
    And I see text "Auto Generated"
    And I don't see button "Remove File"

  Scenario: Edit SSH Options
    Given I want to edit key pairs
    Then I wait 1000
    When I toggle switch with label "SSH Tunnel"
    And key pairs have been loaded successfully
    When I scroll to "Custom File Zone"
    Then I see "ssh-rsa demo-hash-key"

  Scenario: Add New Key
    Given I want to edit key pairs
    And I want to create a key pair
    Then I wait 1000
    When I toggle switch with label "SSH Tunnel"
    And key pairs have been loaded successfully
    When I select item "Create Key Pair" in list "ssh tunnel list"
    Then I see label "Key Pair Name"
    And I see button "Create Key Pair"
    When I type "facelift" to "Key Pair Name"
    And I click button "Create Key Pair"
    Then I don't see button "Create Key Pair"
    # NOTE: (TODO) this step currently documents the intent only
    Then new key pair should be created and selected

  Scenario: Select Upload PEM
    Given I want to edit key pairs
    Then I wait 1000
    When I toggle switch with label "SSH Tunnel"
    And key pairs have been loaded successfully
    When I select option "Upload PEM" of "ssh auto generate"
    And I see exact text "55bf7c4270fdca16cac18761_confusion.pem"
    And I see button "Remove File" is visible
    Then I see label "SSH KEY File Password"
    And I don't see button "Edit"

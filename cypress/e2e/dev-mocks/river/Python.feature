Feature: Python
  As a data analyst
  I want to choose Python as my Logic Step Type
  So I could use Python in Logic

  Background:
    Given I want to see an empty python step
    Given I am signed in as fake user to the app with python river
    Given I want to select resources
    Given I want to test errors
    When logic river page is displayed
    When I select Step Type "Python" of "Python-Step"

  Scenario: Display default template for Python
    Then I see tab "Script" is selected
    Then I see Code Editor
    Then Editor has content "### Quick start examples ###"
    Then Editor has content "# Please visit Boomi Data Integration documentation for more info https://help.boomi.com/docs/Atomsphere/Data_Integration/Rivers/LogicRiver/LogicSteps/Python/"
    Then Editor has content "### Variables ###"


  Scenario: Select Python
    Then I see text "Import file"
    Then I see tab "Script" is selected
    And I see text "Python Script"
    Then I see tab "Packages" is not selected

  Scenario: View Packages
    Then I see tab "Script" is selected
    Then I see tab "Packages" is not selected
    Given I want to test errors
    When I select tab "Packages"
    Then I see tab "Script" is not selected
    Then I see tab "Packages" is selected

  Scenario: View Resources and select a new resource
    When Resources have loaded
    Then I see text "Resources"
    When I click "Resources (XS)"
    And I wait 500
    Then I see label "resources selector"
    Then I see texts "Size" 2 times
    Then I see text "RAM \(GB\)"
    Then I see text "CPU \(Cores\)"
    Then I see texts "0.5"
    Then I see text "BDU per second will be calculated according to the resource size selected"
    When I click "XL"
    Then I see text "Resources \(XL\)"

# As a data analyst
# I want to upload my Python py file
# So I could use Python code in Rivery

# Scenario: Upload py file
#   # Given I want to upload a jar file
#   When I upload a PY file to "import py file"
#   Then I see text 'print("Hello World")'
#   Then I see text "uploaded successfully"

# As a data analyst
# I want the option save results to target variable
# So I could use the results later in the logic process
# default is on
# Scenario: Save to Target - toggle
#   Then I see label "Variable Name"
#   When I switch "Save to Target"
#   Then I don't see label "Variable Name"
#   Then I don't see label "River Variable"

# As a data analyst
# I want to save results to target variable
# So I could use the results later in the logic process
# Rule: save to target should be checked
# Scenario: Save to Target with a variable
#   Then I see label "Variable Name"
#   When I select variable "Global Variable"
#   Then I see variable "Global Variable" is checked
#   When I select "aws_file_zone" in Variable Name
#   Then I see Variable Name with "aws_file_zone"

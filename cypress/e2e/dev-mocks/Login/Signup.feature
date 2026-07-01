Feature: Signup
  As a new user
  I want to signup a new rivery account
  So I can create rivers

  Scenario: Signup new user
    Given I want to signup with a new user
    Then I see text "Welcome back"
    When I click text "Sign Up"
    Then I see text "Start your free trial"
    Given I type "demon@ofthe.fall" inside "Email"
    And I type "Hihihoho42!" inside "Password"
    When I click button "Get Started"
    And Signup process completes
    Then I see the Start your free trial screen
    Given I want to continue with free trial and verify my email
    Then I see hidden input with value "demon@ofthe.fall"
    When I click button "Get Started"
    And free trial getting started is successful
    Then I see text "You’re just a step away..."
    And I see text "Check your inbox to verify your email address"
    And I see text "Contact Us"
    And I see text "demon@ofthe\.fall"

  Scenario: Validate strong password for a new user
    Given I want to signup with a new user
    Then I see text "Welcome back"
    When I click link "Sign Up"
    Then I see text "Start your free trial"
    Given I type "unicorn@rivery.io" inside "Email"
    And I type "weak" inside "Password"
    When I click button "Get Started"
    Then I see text "Password does not meet requirements"

  Scenario: Signup with Google and bad registration in backend
    Given I sign up with google
    When google signup redirects to the app
    Then I see the Start your free trial screen
    And I see input with value "John"
    And I see input with value "Doe"
    When I type "DoeSpace" inside "Company Name"
    When I type "DoeSpace" inside "Account Name"
    Given I want to continue with free trial but I get server error
    When I click button "Get Started"
    Then I see text "We had a problem creating your account. Please try again later or open a support ticket"

  Scenario: Displays errors when signup fails
    Given I want to test errors
    Given I want to signup with an existing user
    Then I see text "Welcome back"
    When I click link "Sign Up"
    Then I see text "Start your free trial"
    Given I type "unicorn@rivery.io" inside "Email"
    And I type "Hihihoho32!" inside "Password"
    When I click button "Get Started"
    And Signup process completes
    Then I see text "An account with this email address already exists."
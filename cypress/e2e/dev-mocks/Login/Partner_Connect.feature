Feature: Partner Connect
  As a new user
  I want to signup a new rivery account from a partner
  So I can create rivers

  Scenario: Signup with snowflake
    Given I signed up with snowflake
    When I open the snowflake signup link
    Then I see in url "partner-signup"
    And I see text "Welcome, John!"
    And I see text "Build complex end-to-end ELT data pipelines fast"
    And I see input with value "tester@rivery.io"
    And I see button "create my account"
    When I type "tester" inside "Company Name"
    And I type "RiveryTest" inside "Password"
    And I type "RiveryTest" inside "Job Title"
    And I type "RiveryTest" inside "Phone Number"
    Then I select country
    Then I see text "Password should contain at least 6 characters, containing english letters"
    When I type "RiveryTest123!" inside "Password"
    And I click button "create my account"
    Then I see options to create river

  Scenario: Signup with databricks
    Given I signed up with databricks
    When I open the databricks signup link
    Then I see in url "partner-signup"
    And I see text "Welcome, Shiran!"
    And I see text "Build complex end-to-end ELT data pipelines fast"
    And I see input with value "briverytest123@databricks.com"
    And I see button "create my account"
    When I type "tester" inside "Company Name"
    And I type "RiveryTest" inside "Password"
    And I type "RiveryTest" inside "Job Title"
    And I type "RiveryTest" inside "Phone Number"
    Then I select country
    Then I see text "Password should contain at least 6 characters, containing english letters"
    When I type "RiveryTest123!" inside "Password"
    And I click button "create my account"
    Then I see options to create river


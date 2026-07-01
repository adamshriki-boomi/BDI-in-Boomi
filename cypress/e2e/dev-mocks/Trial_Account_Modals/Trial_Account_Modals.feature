Feature: Trial Account Modals
    As a user who's trial mode has expired or was extended
    I should see a modal once I sign in
    I can dismiss it or open subscription plans
    Scenario: Sign in to account, see expired modal and try to extend trial
        Given I am a trial mode user with expired trial
        Then I see text "Oh No... Your Free Trial Is Over"
        And I click button "Request Extend Trial"
        And I see text "Request To Extend Trial"

    Scenario: Open subscription plans from trial expired modal
        Given I am a trial mode user with expired trial
        Then I see text "Oh No... Your Free Trial Is Over"
        And I click button "Subscribe Now"
        And I see text "Pricing Plans"

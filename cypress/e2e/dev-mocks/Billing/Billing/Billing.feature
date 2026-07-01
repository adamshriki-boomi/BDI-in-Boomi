Feature: Billing Feature
  As a trial user
  I want see the pricing plans and to be able to subscribe to Rivery

  Scenario: I see Free Trial Banner and Pricing Plans
    Then I see "trial" account banner
    And I see text "Your free trial has ended"
    And I see button "Upgrade Now"
    When I click button "Upgrade Now"
    Then I see text "Pricing Plans"

  Scenario: I cant dismiss Account Banner when it's blocked
    When I see "trial" account banner
    And I don't see button "close-banner"

  Scenario: I see top section Consumption details for Trial Plan
    When I open Subscription & Billing page
    Then I see text 'Manage your account plan and payment details'
    And I see text "Enjoy full access" within "Consumption-top-section"
    And I see chip "Free" within "Consumption-top-section"
    And I see button "Subscribe Now" within "Consumption-top-section"

  Scenario: I see bottom section Consumption details for Trial Plan
    When I open Subscription & Billing page
    Then I see labels:
      | Consumption-bottom-section |
      | subscription-period        |
      | rpu-consumption-progress   |
    And I see text "Subscription Period"
    And I see text "Current BDU Spend"
    And I see text "Trial Start Date" within "subscription-period"
    And I see text "Trial End Date" within "subscription-period"
    And I see text "Your free trial has ended" within "subscription-period"

  Scenario: I see Trial Upsale Banenr - when I didn't create any rivers
    When I open Subscription & Billing page
    Then I see label "account-upsale-banner"
    And I see text 'Let’s Simplify Your Data Flow' within "account-upsale-banner"
    And I see text 'Still working on your first data pipeline?' within "account-upsale-banner"
    And I see button 'Contact a Data Expert'

  Scenario: I see Trial account was blocked by Rivery admin
    Given I am signed in as blocked by admin trial user to the app
    Then I see "blocked" account banner
    And I see text "Your account is blocked. Contact us for more information."
    And I see button "Contact Us"

  Scenario: I see Starter PAYG Top Section Details
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Starter" plan
    Then I click button "Log In"
    Then I wait 500
    Then I open Subscription & Billing page
    Then I see button "Manage Billing"
    And I see text "Starter" within "Consumption-top-section"
    And I see chip "On Demand" within "Consumption-top-section"
    And I see button "Upgrade Your Plan" within "Consumption-top-section"
    When I click force button "Upgrade Your Plan"
    Then I see text "Pricing Plans"

  Scenario: I see Starter PAYG Bottom Section Details
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Starter" plan
    Then I click button "Log In"
    Then I wait 500
    Given I want to see usage for plan
    Then I open Subscription & Billing page

    Then I see labels:
      | Consumption-bottom-section |
      | subscription-start-date    |
      | monthly-rpu-usage          |
    And I see text "Subscription Start Date"
    And I see text "Current BDU Spend"
    And I see text "Current Month" within "monthly-rpu-usage"
    And I see text "233.5" within "monthly-rpu-usage"
    And I see text "49.73%" within "monthly-rpu-usage"
    And I see text "464.5" within "monthly-rpu-usage"
    And I see text "2.15%" within "monthly-rpu-usage"
    And I see text "Last Month" within "monthly-rpu-usage"

  Scenario: I see Starter Annual Top Section Details
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Starter_annual" plan
    Then I click button "Log In"
    Then I wait 500
    Given I want to see usage for plan
    Then I open Subscription & Billing page
    Then I don't see button "Manage Billing"
    And I see text "Starter" within "Consumption-top-section"
    And I see chip "Annual" within "Consumption-top-section"
    And I see button "Upgrade Your Plan" within "Consumption-top-section"
    When I click force button "Upgrade Your Plan"
    Then I see text "Pricing Plans"

  Scenario: I see Starter Annual Bottom Section Details
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Starter_annual" plan
    Then I click button "Log In"
    Then I wait 500
    Then I open Subscription & Billing page
    Then I see labels:
      | Consumption-bottom-section |
      | subscription-period        |
      | rpu-consumption-progress   |
    And I see text "Subscription Period"
    And I see text "Current BDU Spend"


  Scenario: I see Starter Annual Upsale Banenr
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Starter_annual" plan
    Then I click button "Log In"
    Then I wait 500
    Then I open Subscription & Billing page
    Then I see label "account-upsale-banner"
    And I see text 'Self-managing your Python?' within "account-upsale-banner"
    And I see button 'Contact a Data Expert'


  Scenario: I see Professional Annual Top Section Details
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Professional" plan
    Then I click button "Log In"
    Then I wait 500
    When I open Subscription & Billing page
    And I see text "Professional" within "Consumption-top-section"
    And I see chip "Annual" within "Consumption-top-section"
    And I see button "Upgrade Your Plan" within "Consumption-top-section"
    When I click force button "Upgrade Your Plan"
    Then I see text "Pricing Plans"

  Scenario: I see Professional Annual Bottom Section Details
    Given I want to signout
    When I want to clear all sessions
    Then I click label "user-menu"
    Then I click button "Log Out"
    Then I type 'email@email.com' inside 'Email'
    Then I type 'password' inside 'Password'

    Given I am subscribed to the "Professional" plan
    Then I click button "Log In"
    Then I wait 500
    When I open Subscription & Billing page
    Then I see labels:
      | Consumption-bottom-section |
      | subscription-period        |
      | rpu-consumption-progress   |
    And I see text "Subscription Period"
    And I see text "Current BDU Spend"

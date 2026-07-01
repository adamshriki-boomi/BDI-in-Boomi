
Feature: Starter Upgrade Modal Feature
  As a user that is subscribed to the starter plan
  I want to check I am able to get features that I dont have access to
  Background:
    Given I am subscribed to the "Starter_annual" plan

  Scenario: I get all audit logs
    When I click button "Settings"
    Given I want to get audit logs
    And I click menu button "Audit Log"
    And I see label "audit log list"
    And I see all event types inside "audit log list"
    And I see all entity types inside "audit log list"


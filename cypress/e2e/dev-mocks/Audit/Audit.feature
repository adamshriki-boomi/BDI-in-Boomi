Feature: Audit Feature
    As a user
    I want to check I am able to get logs and filter them
    Background:
        Given I want to get audit logs

    Scenario: I get all audit logs
        When I click button "Settings"
        And I click menu button "Audit Log"
        And I see label "audit log list"
        And I see all event types inside "audit log list"
        And I see all entity types inside "audit log list"

    Scenario: I filter only connections and reset to default
        When I click button "Settings"
        And I click menu button "Audit Log"
        When I filter only "connections" from "entity_type"
        Then I don't see text "river" within "audit log list"
        And I don't see text "user" within "audit log list"
        And I see text "Test connection" within "audit log list"
        And I want to clear filters
        Then I click button 'clear filters'
        Then I see all entity types inside "audit log list"

    Scenario: I filter by multiple filters and get the right results
        When I click button "Settings"
        And I click menu button "Audit Log"
        When I filter only "users" from "entity_type"
        Then I don't see text "river" within "audit log list"
        Then I don't see text "connection" within "audit log list"
        And I see all event types inside "audit log list"
        Then I filter only "update" from "event_type"
        Then I don't see text "deleted" within "audit log list"
        Then I don't see text "created" within "audit log list"

    Scenario: Remove single filter
        When I click button "Settings"
        And I click menu button "Audit Log"
        When I filter only "users" from "entity_type"
        Then I don't see text "river" within "audit log list"
        Then I don't see text "connection" within "audit log list"
        And I want to clear filters
        And I click body
        Then I click label "entity_type-clear-indicator"
        Then I see text "Test connection" within "audit log list"
import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given('I want to see teams', () => {
  cy.interceptGetApi1('/teams*', 'teams/get.teams.json');
})

Given("I want to filter teams", () => {
    cy.interceptGetApi1('/teams*', 'teams/get.teams.filter.json');
})

Given("I want to see only this team users", () => {
    cy.interceptGetApi1('/users*', 'teams/get.team.users.json');
})

Given("I want to see selected user from Group", () => {
    cy.interceptGetApi1('/permissions', 'teams/get.user.permissions.json');
    cy.interceptGetApi1('/users/*', 'teams/get.single.user.json');
})
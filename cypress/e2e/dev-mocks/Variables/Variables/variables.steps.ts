import { Given, Then, When, Step } from "@badeball/cypress-cucumber-preprocessor";

Given('I want to see Variables Table', () => {
    Step(this, "I click sidebar 'Variables'")
})

Given('I want to add a specific new variable',() => {
    cy.interceptPostApi('environments/add_variable*', 'environments/variable.add-single-environment.json')
})

Given('I want to edit an existing variable',() => {
    cy.interceptPatchApi('environments/update_variable*', 'environments/update_variable.PATCH.json')
})

const deleteEnvUrl = 'environments/delete_variable*';
Given('I want to delete an existing variable',() => {
    cy.interceptEnvironments('environments/environments.get.after-delete')
})
Given('I want to delete variable {string}',(variable: string) => {
    cy.interceptDeleteApi(`${deleteEnvUrl}=${variable}`, 'environments/variable.delete.json')
})

Given('I am about to click Add Variable', () => {
    cy.interceptEnvironments('environments/environments.added-variable.get.json')
})

Given('I get back updated variables', () => {
    cy.interceptEnvironments('environments/environments.updated-variable.get.json' )
})

Given('I get back deleted variables', () => {
    cy.interceptEnvironments('environments/variable.delete.json' )
})

When('Update environments operation completes', () => {
    cy.interceptGetApi1('environments*', 'environments/environments.get.json')
})

Then('I see the {string} variable in the delete request', (variable: string) => {
    cy.wait(`@${deleteEnvUrl}=${variable}`).then(({ request }) => {
        expect(request.url).to.contain(variable)
    });
})
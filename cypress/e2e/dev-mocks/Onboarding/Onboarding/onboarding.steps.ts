import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";


Given('I want to see the onboarding page', () => {
    cy.interceptGetApi1('onboarding', 'onboarding/get.onboarding.json');
})

Given('I want to update {string} with substep {string}', (step:string, substep:string) => {
    cy.interceptPostApi1('onboarding', `onboarding/post.onboarding.${step}.${substep}.json`)
    cy.interceptGetApi1('onboarding', `onboarding/post.onboarding.${step}.${substep}.json`)
})

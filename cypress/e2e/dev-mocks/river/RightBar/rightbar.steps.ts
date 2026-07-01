import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { RiverMocks, signToAppWithRiver } from '../../common/utils/login';

Given('I create new angular river', () => {
    signToAppWithRiver(RiverMocks.NonVersionMode);
    cy.rivery('river/fake1/fake2/river?selected_river_type=src_to_fz');
    // Fake mock just to prevent failures
    cy.interceptGetApi('/has_rivers?*', 'rivers-list/river.last-runs.json')
    cy.interceptGetApi('/source?*','rivers-list/river.last-runs.json')
    cy.interceptGetApi('/all?*','rivers-list/river.last-runs.json')
  });
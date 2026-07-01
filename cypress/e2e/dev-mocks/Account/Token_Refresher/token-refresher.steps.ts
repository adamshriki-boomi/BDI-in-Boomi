import { When } from '@badeball/cypress-cucumber-preprocessor';
import { modifyRiver } from '../../common/river-footer.steps';

When('I continue with my work after my session has expired', () => {
  cy.clickButton('Save');
  cy.clickButton('Save Anyway');
  cy.wait('@token*').then(({ request, response }) => {
    expect(request.body).to.be.not.empty;
    expect(response.body).to.have.property('token', 'faked');
  });
  cy.wait(`@${modifyRiver}`).then(({ request }) => {
    expect(request.body).to.be.not.empty;
    expect(request.headers).to.have.property('authorization', 'faked');
  });
});

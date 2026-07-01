import { Given } from '@badeball/cypress-cucumber-preprocessor';

function MultiStepTypes(path, handler, types) {
  return types.map(type => type(path, handler));
}

export function WhenAndBut(path, handler) {
  return MultiStepTypes(path, handler, [Given]);
}

type Assertion = 'exist' | 'not.exist' | 'be.visible';
export const findLabelsInDataTables = (assert: Assertion, exact = false) => dataTable => {
  dataTable.rawTable
    .slice(1)
    .forEach(row =>
      cy.findByLabelText(exact ? row[0] : new RegExp(row[0], 'i')).should(assert),
    );
};

export const findTextsDataTablesInIframe = () => dataTable => {
  dataTable.rawTable
    .slice(1)
    .forEach(row => cy.getIframeBody().should('contain.text', row[0]));
};

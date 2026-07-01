import { Given, When, Step } from "@badeball/cypress-cucumber-preprocessor"
import dayjs from 'dayjs';


When('I want to create a new source to target river', () => {
    Step(this, "I click label 'Create'")
    Step(this, "I see link 'src_to_fz'")
    Step(this, "I click link 'src_to_fz'")
    Step(this, "I see text 'Select the Data Source you want to establish a connection with.'")
})

When('I select {string} as the {string}', (source:string, type: 'Source' | 'Target') => {
    Step(this, `I type '${source}' inside 'search'`)
    Step(this, `I see label '${source}-tile'`)
    Step(this, `I click label '${source}-tile'`)
    Step(this, `I see text 'Selected Data ${type}'`)
    Step(this, `I see text '${type} Connection'`)
})

When('I want to create a new connection', () => {
    cy.wait(500)
    Step(this, "I select item 'Add New Connection' in list 'connections'")
    Step(this, "I see text 'Create Connection'")
  })

When('button {string} is visible', (button:string) => {
    cy.findButton(button, { timeout: 300000 }).should('be.visible')
})  

When('text {string} is visible', (text: string) => {
  cy.findByText(text, { timeout: 300000 }).should('be.visible');
});

When('text {string} is not visible', (text: string) => {
  cy.findByText(text, { timeout: 300000 }).should('not.exist');
});

When('button {string} is active', (button:string) => {
    cy.findButton(button, { timeout: 300000 }).should('have.css','pointer-events','all')
})  

When('I scroll {string} to the left', (element: string) => {
  cy.get(`[aria-label="${element}"]`).scrollTo('30%', 0);
});

When('I wait for input {string} and type {string}', (label: string, value: string) => {
    cy.get(`input[aria-label="${label}"]`).should('exist').should('be.visible').type(value, { force: true });
  },
);


When('I see copied river in the list', function () {
  cy.get('@riverName').then((name) => {
    cy.contains(String(name)).should('be.visible');
  });
});

When('I type river name to {string}', function (label: string) {
  cy.get('@riverName').then((name) => {
    const value = String(name).trim();
    expect(value, 'River name must not be empty when typing into search').not.to.eq('');
    cy.findByLabelText(label).clear().type(value);
  });
});


When('I force switch {string} in {string} definitions', (name: string, type:string) => {
  const timeout = 30000;
  cy.get('body', { timeout }).should('be.visible');
  cy.get('body').then($body => {
    if ($body.find('.chakra-collapse[style*="display: none"]').length > 0) {
      cy.contains(`Advanced ${type} Definitions`, { timeout })
        .should('exist')
        .click({ force: true });
      cy.wait(1000);
    }

    cy.get('body').then($body => {
        cy.contains(name)
          .closest('.chakra-form-control')
          .find('input[type="checkbox"]')
          .click({force: true});
    });
  });
});


let generatedTimestamp: string;
When('I type the current timestamp to {string}', (label: string) => {
  generatedTimestamp = dayjs().format('YYYYMMDD_HHmmss');
  const timestampToAdd = `${generatedTimestamp}`;

  cy.findByLabelText(label).type(timestampToAdd);
});



When('I copy current river name', () => {
  cy.get('input[aria-label="Data Flow Name"]', { timeout: 10000 })
    .should('be.visible')
    .invoke('val')
    .then((riverName) => {
      const name = String(riverName ?? '').trim();
      expect(name, 'Data Flow Name field must not be empty when copying').not.to.eq('');
      cy.wrap(name).as('riverName');
    });
});

When('I set a unique river name for this test with prefix {string}', (prefix: string) => {
  const uniqueName = `${prefix}-${dayjs().format('YYYYMMDD_HHmmss')}`;
  cy.findByLabelText('Data Flow Name', { timeout: 10000 }).should('be.visible').clear().type(uniqueName);
  cy.wrap(uniqueName).as('riverName');
});


When('I type {string} to {string} {string}', (text: string, label: string, type: 'input' | 'textarea') => {
  cy.get('body').then($body => {
    cy.get('.chakra-modal__body', { timeout: 30000 }).should('be.visible');
    cy.get('.chakra-modal__body').then($modal => {
        cy.get('.chakra-modal__body')
          .contains('label', label)
          .parents()
          .eq(1)
          .find(type)
          .clear()
          .type(text);
    });
  });
});





Given('I want to save a River', () => {
  // S2T uses RTK Query: POST .../rivers (create) or PUT .../rivers/{id} (update)
  cy.intercept('POST', /\/accounts\/[^/]+\/environments\/[^/]+\/rivers$/).as('riverSaved');
  cy.intercept('PUT', /\/accounts\/[^/]+\/environments\/[^/]+\/rivers\/.+/).as('riverSaved');
});

When('River was saved', () => {
  // POST (create) returns 201 Created; PUT (update) returns 200 OK
  cy.wait('@riverSaved', { timeout: 120000 }).its('response.statusCode').should('be.within', 200, 201);
});


When('I click river link with saved name', function () {
  cy.get('@riverName').then((name) => {
    cy.get(`a[aria-label="${name}"]`).click({ force: true });
  });
});



When('I click the actions menu button for the saved river', function () {
  cy.get('@riverName').then((name) => {
    const selector = `button[aria-label="river ${name} actions"]`;
    cy.get(selector, { timeout: 20000 }).click({ force: true });
  });
});


// When('Select the river', ()=> {
//   Step(this, "I click label 'environment account selector'");
//   Step(this, "I click force text 'Create river test'");
//   Step(this, "The selected environment has loaded");
//   Step(this, "I click sidebar 'Rivers'");
//   })

  When('I select extraction method, select {string} and table and add incremental field', (schema: string) => {
    Step(this, "I click label 'Standard Extraction'");
    Step(this, `I click button '${schema}'`);
    Step(this, "I check 'select table react_automation'");
    Step(this, "I click label 'react_automation target_table'");
    Step(this, "I type '_test' to label 'react_automation target_table'");
    Step(this, "I scroll to 'Extract Method'");
    Step(this, "I select item 'incremental' in list 'select react_automation extract method'");
    Step(this, "I select item 'id' in list 'select react_automation incremental field'");
  });

  When('I test filter and chunk size fields in Source settings', () => {
    Step(this, "I click button 'react_automation'");
    Step(this, "I select tab 'Source Settings'");
    Step(this, "I see label 'Table Source Settings'");
    Step(this, "I type '12' to 'Exporter Chunk Size' 'input'");
    Step(this, "I type 'id < 100' to 'Filters' 'textarea'");
  });

  When('I start new s2t river with {string} as source and click label {string}', (source: string, tooltip:string) => {
    Step(this, "I click button 'New Data Flow'");
    Step(this, "I click 'Source to Target Flow'");
    Step(this, `I type '${source}' to 'search'`);
    Step(this, `I click label '${tooltip}'`);
  });

  When('I search and delete new s2t river', () => {
    Step(this, "I type river name to 'search-Data Flows'");
    Step(this, "I see copied river in the list");
    Step(this, "I click river link with saved name");
    Step(this, "I click the actions menu button for the saved river");
    Step(this, "I click text 'Delete Data Flow'");
    Step(this, "I click button 'Yes'");
  });

When('I click Save & Exit in the Exit Data Flow Creation modal', () => {
  // Two "Save & Exit" buttons exist: footer (background) and modal. Scope to the dialog.
  cy.contains('[role="alertdialog"]', 'Exit Data Flow Creation').within(() => {
    cy.findByRole('button', { name: 'Save & Exit' }).should('be.visible').click();
  });
});

When('I want save river name with prefix {string}', (prefix: string) => {
  Step(this, "I click 'Next'");
  Step(this, `I set a unique river name for this test with prefix '${prefix}'`);
  Step(this, "I click 'Save & Exit'");
  Step(this, "I see text 'Exit Data Flow Creation'");
  Step(this, 'I click Save & Exit in the Exit Data Flow Creation modal');
});


When('I select {string} as a target and click label {string}', (target: string, tooltip: string) => {
  Step(this, `I type '${target}' to 'search'`);
  Step(this, `I click label '${tooltip}'`);
});
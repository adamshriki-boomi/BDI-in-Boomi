import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// jQuery returns nbsp (char 160) instead of space (char 32)
const normalizeString = str =>
  str?.replaceAll('\\n', '\n')?.replaceAll(String.fromCharCode(160), ' ');

/** Gherkin may pass real newlines in quoted strings; Cypress needs {enter}, not \n chars. */
const textToCypressType = (text: string) =>
  text
    .replace(/\\n/g, '{enter}')
    .replace(/\r\n/g, '{enter}')
    .replace(/\n/g, '{enter}')
    .replace(/\r/g, '{enter}');
const SQLQueryEditor = 0;
const CompiledSQLEditor = 1;
function getEditorContent(isModal = false, index = SQLQueryEditor) {
  const editorQuery = '.monaco-editor .lines-content';
  const cyBase = isModal
    ? cy
        .findByLabelText('source-editor-modal')
        .find(editorQuery, { timeout: 10000 })
        .eq(index)
    : cy.get(editorQuery, { timeout: 10000 });
  return cyBase
    .wait(1000)
    .find('.view-line')
    .then(content =>
      content
        .toArray()
        .map(({ textContent }) => textContent)
        .map(normalizeString)
        .join('\n'),
    );
}

const typeToEditorModal = (code: string) => {
  return cy.findByLabelText('modal editor').within(() => {
    cy.findEditor()
      .click()
      .type(code)
      // timeout for editor to trigger on change
      .wait(300);
  });
};

Given(/^I start$/i, () => {
  cy.log('Start!!!!!');
});

When(/I expand the first source editor/i, () => {
  cy.findByLabelText('collapse Source').click();
});

When('editor for {string} is ready', (stepName:string) => {
  cy.findStep(stepName).within(() => {
    cy.findEditor();
  });
});

When('I append text {string}', (text:string) => {
  cy.findEditor()
    .click()
    .type(`{movetoend}${textToCypressType(text)}`);
});

When('I wait for editor to show up', () =>
  cy.findByLabelText('modal editor', {
    timeout: 2000,
  }),
);

When('I append modal text {string}', (text:string) => {
  typeToEditorModal('{movetoend}');
  typeToEditorModal(textToCypressType(text));
});

When('I delete modal text {int} characters', (totalChars:number) => {
  const charsToDelete = Array.from(
    { length: totalChars },
    (v, i) => '{backspace}',
  ).join('');
  typeToEditorModal(charsToDelete);
});

When('I {string} modal editor', (action:string) => {
  cy.findByLabelText('source-editor-modal')
    .findByLabelText(action)
    .click()
    .wait(500);
});

Then('Editor has modal content {string}', expectedContent => {
  getEditorContent(true).then(editorContent =>
    expect(editorContent).to.contain(normalizeString(expectedContent)),
  );
});

Then('Compiled SQL Code Editor has content {string}', expectedContent => {
  getEditorContent(true, CompiledSQLEditor).then(editorContent =>
    expect(editorContent).to.contain(normalizeString(expectedContent)),
  );
});

Then('Editor has content {string}', expectedContent => {
  getEditorContent().then(editorContent =>
    expect(editorContent).to.contain(normalizeString(expectedContent)),
  );
});

// RUN RESULTS
const fetchResultsUrl = 'results/*';
const pullResultsUrl = 'pull/results';
const pullResultsPollUrl = 'pull?*id=*';

const interceptRunResults = (pollFixture: string) => {
  cy.interceptPutApi(pullResultsUrl, 'pull/results.W.json');
  cy.interceptGetApi(pullResultsPollUrl, pollFixture);
};

Given('I run an sql query with an error', () => {
  interceptRunResults('pull/pull.E.json');
  cy.interceptGetApi(fetchResultsUrl, 'pull/get.results.ERROR.json', {
    statusCode: 400,
    apiVersion: 0,
  });
});

Given('I run a valid sql query', () => {
  interceptRunResults('pull/pull.D.json');
  cy.interceptGetApi(fetchResultsUrl, 'pull/get.results.json');
});

Given('I run a sql query without results', () => {
  interceptRunResults('pull/pull.D.json');
  cy.interceptGetApi(fetchResultsUrl, 'pull/get.results.EMPTY.json');
});

Given('I run a valid sql query with maximum amount of results', () => {
  interceptRunResults('pull/pull.D.json');
  cy.interceptGetApi(fetchResultsUrl, 'pull/get.results.LIMIT.json');
});

When('results are ready', () => {
  cy.wait(`@${fetchResultsUrl}`);
});

const assertCodeInTask = (code: string, contain: boolean) => {
  cy.wait(`@${pullResultsUrl}`).then(({ request }) => {
    const taskConfig = request.body.tasks_definitions[0].task_config;
    expect(taskConfig).to.have.property('current_step');
    if (contain) {
      expect(taskConfig.current_step.content.sql_query).to.contain(code);
    } else {
      expect(taskConfig.current_step.content.sql_query).to.not.contain(code);
    }
    expect(taskConfig).to.have.property('variables');
  });
};
Then('I expect run results to include the {string}', (code: string) => {
  assertCodeInTask(code, true);
});
Then('I expect run results to not include the {string}', (code: string) => {
  assertCodeInTask(code, false);
});

When('I click Run', () => {
  cy.clickButton('Run');
});

Then('I see Run Button', () => {
  cy.findButton('Run');
});

Then('I can scroll results', () => {
  cy.get('[aria-label="query results list"]').scrollTo('bottomRight');
});

Then('I see Code Editor', () => {
  cy.findByLabelText('code editor').should('be.visible');
})
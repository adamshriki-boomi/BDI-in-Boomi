import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// UTILS
const versionsList = 'rivers/*/versions*';
const bookmarkApi = 'rivers/versions/bookmark_version*';
const unbookmarkApi = 'rivers/versions/unbookmark_version*';
const getVersionDetails = 'rivers/versions/details*';
const postRestoreVersion = 'rivers/restore';
const postNameVersion = 'rivers/versions/name';
const putVersionRestore = 'rivers/*/restore'

// STEPS
Given('I want to review versions', () => {
  cy.interceptGetApi1(versionsList, 'versions/list.get.json');
  cy.interceptPostApi(bookmarkApi, 'versions/bookmark.post.json');
  cy.interceptPostApi(unbookmarkApi, 'versions/unbookmark.post.json');
  cy.interceptApi(getVersionDetails, 'versions/details.index-3.get.json');
  cy.interceptPostApi(postRestoreVersion, 'versions/restore.post.json');
  cy.interceptPostApi(postNameVersion, 'versions/name.post.json');
});

Given('versions are loaded with corrupted data', () => {
  cy.interceptGetApi1(versionsList, 'versions/list.get.invalid.json');
});
const waitForVersionsListAndStats = () => {
  cy.wait(`@${versionsList}`);
}
When('versions requests have completed', () => {
  waitForVersionsListAndStats();
});
When('versions have been loaded successfully', () => {
  waitForVersionsListAndStats()
  cy.findByText('Only show bookmarked versions', { timeout: 1000 });
});

When('version has loaded', () => {
  cy.wait(`@${getVersionDetails}`);
});

When('river has loaded', () => {
  cy.waitRiver()
})

When('version has been restored successfully', () => {
  cy.wait(`@${postRestoreVersion}`);
});

When('page has reloaded', () => {
  cy.waitRiversGet();
  cy.waitApi('river_groups*')
});

Then('version is bookmarked', () => {
  cy.wait(`@${bookmarkApi}`);
});

Then('version is not bookmarked', () => {
  cy.wait(`@${unbookmarkApi}`);
});

Then('version name is updated', () => {
  cy.wait(`@${postNameVersion}`);
});

When('I type to version {string} in place {int}', (text: string, place: number) => {
  cy.findAllByLabelText('select version').eq(place - 1).within(() => {
    cy.get('input').wait(0).focus().type(text);
  })
});

When('I see latest version is selected', () => {
  cy.get('[aria-selected=true][aria-label=version-box]').within(() => {
      cy.findByText('Latest Version')
  })
})
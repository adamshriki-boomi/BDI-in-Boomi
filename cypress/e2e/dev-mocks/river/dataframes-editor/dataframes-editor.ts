import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const waitDataFrameWithoutLandingZone = (alias, dataFrameName) => {
  cy.wait(`@${alias}`).then(config => {
    const body = config.request.body;
  expect(body).to.have.property('name', dataFrameName);
  expect(body).to.not.have.property(
    'connection_settings',
  );
  });
};

When('I delete dataframe', () => {
  cy.interceptDeleteApi1('dataframes/*', 'dataframes/delete.json');
  cy.interceptDataframesGet('list.delete.json');
});

Given('I want to edit a dataframe', () => {
  cy.interceptPutApi1(
    'dataframes/*',
    'dataframes/edit.json',
    200,
    'dataframePut',
  );
});

Given('I want to test data frames', () => {
  cy.interceptDataframesGet('list.json');
  cy.interceptConnection('aws', 'connections.type.aws');
  cy.interceptConnectionId('snowflake');
});

Given('there are multiple dataframes', () => {
  cy.interceptDataframesGet('list.1.json', 'page=1');
  cy.interceptDataframesGet('list.2.json', 'page=2');
  cy.interceptConnection('aws', 'connections.type.aws');
  cy.interceptConnectionId('snowflake');
});

Given('I want to test error in adding a dataframe', () => {
  cy.interceptPostApi1(
    'dataframes*',
    'dataframes/add.error.json',
    400,
    'dataframePost',
  );
});

When('I add dataframe', () => {
  cy.interceptPostApi1(
    'dataframes*',
    'dataframes/add.json',
    200,
    'dataframePost',
  );
  cy.interceptDataframesGet('list.add.json');
});

When('I add another dataframe', () => {
  cy.interceptDataframesGet('list.add_another.json');
});

Then('dataframe {string} has been added', dataFrameName => {
  cy.wait(`@dataframePost`).then(config => {
    expect(config.request.body).to.have.property('name', dataFrameName);
  });
});

Then('dataframe {string} has been added without landing zone', dataFrameName => {
  waitDataFrameWithoutLandingZone(`dataframePost`, dataFrameName);
});

Then('dataframe add has been failed', dataFrameName => {
  cy.wait(`@dataframePost`).then(config => {
    console.log(config.request.body);
  });
});

Then(
  'dataframe {string} has been updated with landing zone {string}',
  (dataFrameName, landingZoneId) => {
    cy.wait(`@dataframePut`).then(config => {
      expect(config.request.body).to.have.property('name', dataFrameName);
      expect(config.request.body.connection_settings).to.have.property(
        'connection',
        landingZoneId,
      );
    });
  },
);

Then(
  'dataframe {string} has been updated without landing zone',
  (dataFrameName) => {
    waitDataFrameWithoutLandingZone(`dataframePut`, dataFrameName);
  }
);

When('custom landing zone names are ready', () => {
  cy.waitConnection('aws').then(({ response }) => {
    expect(response.body).to.not.be.empty;
  });
});

Then('I see custom landing zones sorted as {string}', (landingZones: string) => {
  const zones = landingZones.split(',').map(zone => zone.trim());
  cy.get('*[role=cell][data-firstinrow="false"]').then(results => {
    const visibleZones = results.filter((i, el) => zones.some(zone => el.textContent.includes(zone.trim()))).map((i, el) => el.textContent);
    const allZonesAreSorted = zones.every((zone, index) => visibleZones[index] === zone);
    expect(allZonesAreSorted).to.be.true;
  })
})

When('I sort data frame table by {string}', (columnHeader: string) => {
  cy.findByLabelText('data frame editor').within(() => {
    cy.findByText(columnHeader).should('be.visible').click()
  })
})
import { Given, Step, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// ─────────────────────────────────────────────────────────────────────────────
// Background — set up a Blueprint-flavoured source-to-target river entry.
//
// Notes:
//   - This mirrors the pattern in stt_river/stt.steps.ts: stub all of the
//     endpoints the page hits before navigation, then visit the route.
//   - The data sources picker must surface a "Blueprint" tile. Existing tests
//     pull this from the standard data-sources fixture; if the fixture in your
//     env doesn't include it, intercept `*data_sources*` with a fixture that
//     does before this step runs.
// ─────────────────────────────────────────────────────────────────────────────

Given('I want to create a source to target flow with a Blueprint', () => {
  // Reuse the existing s2t bootstrap (login, env, data sources, etc.).
  Step(this, 'I want to create a source to target flow');
});

// ─────────────────────────────────────────────────────────────────────────────
// Per-flavor blueprint API stubs.
// ─────────────────────────────────────────────────────────────────────────────

Given('I have a legacy Blueprint available', () => {
  // Stub the connections lookup that fires when "Blueprint" is picked as the
  // source. Returns an empty list — SelectRecipeDropdown doesn't need a
  // pre-existing connection for the picker to render.
  cy.interceptConnection('blueprint_custom', 'connections.empty.json');
  cy.mockBlueprintFlow('legacy');
});

Given('I have a multi-report Blueprint available', () => {
  cy.interceptConnection('blueprint_custom', 'connections.empty.json');
  cy.mockBlueprintFlow('multi');
});

// ─────────────────────────────────────────────────────────────────────────────
// Blueprint selection.
//
// Navigates from the data-source picker to the Blueprint dropdown and picks
// the named entry. The text in the dropdown must match the fixture's `name`
// field on cypress/fixtures/blueprints/list.json.
// ─────────────────────────────────────────────────────────────────────────────

When('I select the {string} Blueprint', (blueprintName: string) => {
  Step(this, "I type 'Blueprint' to 'search'");
  Step(this, "I click 'Blueprint'");
  // After picking Blueprint the user lands on a "How do you want to set up
  // your Data Source?" screen with two cards. We want the existing-list flow.
  Step(this, "I click 'Select Existing Blueprint'");
  // The Blueprint picker dropdown appears on the same step. controlId in
  // SelectRecipeDropdown.tsx is "select blueprint" — matches the listbox
  // aria-label. After selection InterfaceParametersComponent renders inline
  // below the dropdown (Connection, Time Period for legacy, Standard fields).
  // We intentionally stop here without clicking Next so assertions can verify
  // the source-tab UI on Step 1.
  Step(this, `I select item '${blueprintName}' in list 'select blueprint'`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Continue past Step 1 — used by scenarios that need to reach the reports
// grid / Configure Schema. Mirrors the standard s2t flow with Snowflake as
// the target (taken from stt.steps.ts "I setup source and target").
// ─────────────────────────────────────────────────────────────────────────────

When('I continue to the reports grid', () => {
  Step(this, "I click 'Next'");
  // Step 2: Select Data Target — pick Snowflake (reuses the same fixtures the
  // existing s2t tests load).
  Step(this, "I type 'snowflake' to 'search'");
  Step(this, "I click 'Snowflake'");
  Step(this, "I want to set DB and schema");
  Step(this, "I select item 'Rivery Snowflake' in list 'connections'");
  Step(this, "I click label 'refresh-metadata' at index 0");
  Step(this, "I want to set DB and schema");
  Step(this, "I wait 1500");
  Step(this, "I select item 'DEMO_DB' in list 'database_name'");
  Step(this, "I select item 'DEMO_DB' in list 'schema_name'");
  Step(this, "I click 'Next'");
  // Step 3: Configure Schema — reports grid renders here.
  Step(this, "I click 'Configure Schema'");
});

// ─────────────────────────────────────────────────────────────────────────────
// Target variants for scenarios 13/14 (Loading Mode column visibility).
//
// NOTE: assumes the standard target data sources fixture already includes the
// targets used here. If S3 or Knowledge Hub isn't present, add it the same way
// we added "Blueprint" to all_v1.get.json + sections_v1_source.json.
// ─────────────────────────────────────────────────────────────────────────────

When('I continue to the reports grid with an S3 target', () => {
  // Step 2: pick S3 as the target. AWS connections fixture provides
  // "s3 testing1" as a selectable connection (cypress/fixtures/connections/
  // connections.type.aws.json).
  cy.interceptConnection('aws', 'connections.type.aws.json');
  Step(this, "I click 'Next'");
  Step(this, "I type 'S3' to 'search'");
  Step(this, "I click 'Amazon S3'");
  Step(this, "I select item 's3 testing1' in list 'connections'");
  // S3 has no DB / schema — Bucket Name auto-fills with {aws_file_zone}.
  Step(this, "I click 'Next'");
  Step(this, "I click 'Configure Schema'");
});

When('I continue to the reports grid with a Knowledge Hub target', () => {
  Step(this, "I click 'Next'");
  Step(this, "I type 'Knowledge Hub' to 'search'");
  Step(this, "I click 'Knowledge Hub'");
  Step(this, "I click 'Next'");
  Step(this, "I click 'Configure Schema'");
});

// ─────────────────────────────────────────────────────────────────────────────
// Date Range picker interactions.
//
// DateTimeEditor's useEffectOnce auto-populates start_date to "now" when it
// mounts with an empty value (see DateTimeEditor.tsx:70). So opening + Apply
// is enough to commit a non-empty date_range.
// ─────────────────────────────────────────────────────────────────────────────

When('I apply the Date Range picker in the source tab', () => {
  // Source-tab DateTimePopover: only one "Select Date" input on Step 1 once a
  // legacy blueprint is selected. Click to open the modal.
  cy.get('input[placeholder="Select Date"]').first().click({ force: true });
  // The popover modal renders "Apply Changes". Scope to the open dialog so we
  // don't accidentally hit a footer Apply Changes button.
  cy.findAllByRole('dialog')
    .filter(':visible')
    .last()
    .findByText('Apply Changes')
    .click({ force: true });
});

When(
  'I apply the Date Range picker on the {string} row',
  (rowName: string) => {
    // Per-row DateTimePopover input is labelled `${reportId} timestamp`.
    cy.findByLabelText(`${rowName} timestamp`).click({ force: true });
    cy.findAllByRole('dialog')
      .filter(':visible')
      .last()
      .findByText('Apply Changes')
      .click({ force: true });
  },
);

When('I apply the Date Range picker inside the drawer', () => {
  // Drawer's Source Settings tab renders DateTimeEditor inline (not the
  // popover). Switching to that tab triggers the auto-populate effect.
  Step(this, "I click 'Table Source Settings'");
});

// ─────────────────────────────────────────────────────────────────────────────
// Drawer + grid assertions.
// ─────────────────────────────────────────────────────────────────────────────

When(
  'I open the table settings drawer for {string}',
  (rowName: string) => {
    // The row's report name is clickable and opens the TableSettingsDrawer.
    cy.findAllByText(rowName).first().click({ force: true });
  },
);

Then('I see column {string}', (columnHeader: string) => {
  Step(this, `I see text "${columnHeader}"`);
});

Then("I don't see column {string}", (columnHeader: string) => {
  Step(this, `I don't see text "${columnHeader}"`);
});

Then('the source tab Date Range input is populated', () => {
  // The source-tab "Date Range" section wraps a DateTimePopover whose input
  // displays the formatted range when populated, empty when not.
  cy.contains('Date Range')
    .parent()
    .find('input')
    .invoke('val')
    .should((value: any) => {
      expect(value).to.not.equal('');
      expect(value).to.not.equal(undefined);
    });
});

Then(
  'the date range cell of {string} remains empty',
  (rowName: string) => {
    cy.findByLabelText(`${rowName} timestamp`)
      .invoke('val')
      .should('eq', '');
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// "Reload Report Metadata" pull request — mocks the metadata pipeline to
// return status "D" (done) with an empty result array. The reload flow uses
// POST /pull_requests followed by polling GET /operations/:id.
// ─────────────────────────────────────────────────────────────────────────────

Given(
  'the reload report metadata pull request returns an empty result',
  () => {
    cy.interceptPostApi1('*pull_requests', 'blueprints/pull_request.done.json');
    cy.interceptGetApi1(
      '*operations/*',
      'blueprints/operation.done.empty.json',
    );
  },
);

Given(
  'the reload report metadata pull request returns columns',
  () => {
    cy.interceptPostApi1('*pull_requests', 'blueprints/pull_request.done.json');
    cy.interceptGetApi1(
      '*operations/*',
      'blueprints/operation.done.with_results.json',
    );
  },
);

When(
  'I remember the date range cell of {string}',
  (rowName: string) => {
    cy.findByLabelText(`${rowName} timestamp`)
      .invoke('val')
      .as('rememberedDateRange');
  },
);

Then(
  'the date range cell of {string} is unchanged',
  (rowName: string) => {
    cy.get('@rememberedDateRange').then((remembered: any) => {
      cy.findByLabelText(`${rowName} timestamp`)
        .invoke('val')
        .should('eq', remembered);
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Navigation back to step 1 (source). Used by scenario 4 to verify report
// edits propagate back to the source-tab Date Range picker.
//
// The s2t flow uses a numbered stepper at the top — clicking the step label
// jumps back. Falls back to a "Back" button if the stepper isn't clickable in
// your build.
// ─────────────────────────────────────────────────────────────────────────────

When('I return to the source step', () => {
  cy.findByText('Set Up Data Source').click({ force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Source-tab Date Range persistence across tab navigation.
//
// SelectRecipeDropdown unmounts when the user leaves Step 1, and its
// useLazyGetReportsInterfaceParametersBatchQuery returns isUninitialized=true
// on remount — so onSelectBlueprint runs again and re-seeds
// blueprint.date_range. The fix preserves the user's picked start/end when
// the new globalParams.date_range.name matches the existing one; these steps
// guard that path.
// ─────────────────────────────────────────────────────────────────────────────

When('I remember the source tab Date Range value', () => {
  cy.contains('Date Range')
    .parent()
    .find('input')
    .invoke('val')
    .as('rememberedSourceDateRange');
});

Then('the source tab Date Range matches the remembered value', () => {
  cy.get('@rememberedSourceDateRange').then((remembered: any) => {
    expect(remembered).to.not.equal('');
    expect(remembered).to.not.equal(undefined);
    cy.contains('Date Range')
      .parent()
      .find('input')
      .invoke('val')
      .should('eq', remembered);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Saved river — opens a previously-saved legacy blueprint river. The fixture
// at rivers-list/blueprint/legacy.river.v1.json has:
//   - source.name = "blueprint"
//   - source.additional_settings.recipe_id = "bp_legacy_1"
//   - schemas.no_schema.ListIssues with is_selected=true and a populated
//     date_range.start_date
//
// SelectRecipeDropdown's onSelectBlueprint preferentially seeds
// blueprint.date_range from the first selected table's saved date_range when
// blueprint_type is legacy, so the source-tab Date Range input should
// populate from this fixture.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Blueprint Edit drawer — opened from /blueprints/:account/:env/blueprints
// with ?blueprint=<id>. The drawer mounts BlueprintCreation which contains
// the YAML Editor + TestBlueprint panel.
// ─────────────────────────────────────────────────────────────────────────────

Given('I open the edit drawer for a legacy Blueprint', () => {
  cy.mockBlueprintFlow('legacy');
  cy.interceptBlueprintFileContent('legacy');
  cy.rivery(
    'blueprints/account1/faked-env-1/blueprints?blueprint=bp_legacy_1',
  );
});

Given('I open the edit drawer for a multi-report Blueprint', () => {
  cy.mockBlueprintFlow('multi');
  cy.interceptBlueprintFileContent('multi');
  cy.rivery(
    'blueprints/account1/faked-env-1/blueprints?blueprint=bp_multi_1',
  );
});

// initiateTest() → addBlueprintFile (POST hidden draft) → fetchReportsBatch
// (GET reports/interface_parameters). Both need to be stubbed before clicking.

When('I click the Test Blueprint button', () => {
  // The hidden-draft file POST must succeed for getParameters() to continue
  // through to the batch fetch. We reuse the same file fixture; flavor only
  // affects cross_id, which the test doesn't check.
  cy.interceptAddBlueprintFile('legacy');
  cy.interceptCreateBlueprint('legacy');
  Step(this, "I click 'Test Blueprint'");
});

Given('the YAML validation endpoint returns an error', () => {
  cy.interceptValidateBlueprintYaml('error');
});

Given('the blueprint file save endpoint returns an error', () => {
  // The Edit drawer flow opens via BlueprintFileEditor (BlueprintCreation
  // with file != null), so Apply Changes hits editBlueprintFile (PUT). Match
  // the file id of the legacy fixture.
  cy.interceptEditBlueprintFile('error', 'legacy');
});

When('I click the Apply Changes button in the edit drawer', () => {
  // The drawer footer has the only visible "Apply Changes" button at this
  // point (the test-panel popover isn't open). Generic step works.
  Step(this, "I click 'Apply Changes'");
});

Then('the edit blueprint drawer is still open', () => {
  // The drawer header reads "Edit Blueprint" (from AddBlueprint.tsx). If it
  // closed, the header would no longer be in the DOM.
  cy.findByText('Edit Blueprint').should('be.visible');
});

Given(
  'I open a saved legacy Blueprint river with a populated row date_range',
  () => {
    cy.mockBlueprintFlow('legacy');
    cy.interceptConnection('blueprint_custom', 'connections.empty.json');
    cy.interceptRiversGetV1('blueprint/legacy.river.v1.json');
    cy.interceptApi('river_groups*', 'river_groups/get.json');
    cy.interceptGetApi1('*operations*', 'metadata/long_running.json');
    Step(this, 'I want to see activities');
    cy.rivery(
      'rivers/account1/faked-env-1/bp_river_legacy_1/Legacy_Blueprint_River',
    );
    // Land on step 1 — SelectRecipeDropdown + InterfaceParametersComponent
    // only render here, and onSelectBlueprint seeds blueprint.date_range from
    // the saved row inside this component's useEffect.
    Step(this, "I click 'Set Up Data Source'");
  },
);

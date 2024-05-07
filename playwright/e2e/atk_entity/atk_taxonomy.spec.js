/**
 * atk_taxonomy.spec.js
 *
 * Validate taxonomy entity.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands';
import * as atkUtilities from '../support/atk_utilities';

// Set up Playwright.
const { test, expect } = require('@playwright/test');

// Import ATK configuration.
import atkConfig from '../../playwright.atk.config';

// Holds standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../data/qaUsers.json';

class TermEditorPage {
  constructor(page) {
    this.page = page;
    this.titleTextField = page.locator('#edit-name');
    this.editorField = page.locator('#edit-description-value');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async fillTitle(title) {
    await this.titleTextField.fill(title);
  }

  async fillText(text) {
    await this.editorField.fill(text);
  }

  async save() {
    await this.saveButton.click();
  }

  async delete() {
    await this.deleteButton.click();
  }

  async expectConfirm() {
    await expect(this.page.locator('h1')).toContainText('Are you sure');
  }

  async confirmDelete() {
    await this.deleteButton.click();
  }
}

test.describe('Entity tests.', () => {
  //
  // Create taxonomy term, confirm it, update it, confirm update then delete it via the UI.
  //
  test('(ATK-PW-1120) Create, update, delete a taxonomy term via the UI. @ATK-PW-1120 @taxonomy @smoke @alters-db', async ({ page, context }) => {
    const testId = 'ATK-PW-1120';
    const uniqueToken = atkUtilities.createRandomString(6);
    const termName = `${testId}: ${uniqueToken}`;
    let bodyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a ultrices tortor.';

    // Log in with the administrator account.
    // You should change this to an account other than the administrator,
    // which has all rights.
    await atkCommands.logInViaForm(page, context, qaUserAccounts.admin);

    //
    // Add a taxonomy node to the tags vocabulary.
    //
    await page.goto(atkConfig.termAddUrl);
    const termEditorPage = new TermEditorPage(page);

    // Fill in as many fields as you need here.
    // Below we provide a name and body.
    await termEditorPage.fillTitle(termName);
    await termEditorPage.fillText(bodyText);
    await termEditorPage.save();

    //
    // Fetch tag id from the list. The new term should be at
    // or near the top.
    //
    await page.goto(atkConfig.termAddUrl.replace(/add/, ''));

    // Extract the links.
    const termViewUrl = await page.locator(`//td/a[contains(.,"${termName}")]`).getAttribute('href');
    const termEditUrl = await page.locator(`//td/a[contains(.,"${termName}")]/../../td/a[contains(.,"edit")]`).getAttribute('href');

    // Validate the body.
    await page.goto(termViewUrl);
    await expect(await page.textContent('#content')).toContain(bodyText);

    //
    // Update the term.
    //
    bodyText = 'Ut eget ex vitae nibh dapibllus vulputate ut id lacus.';

    await page.goto(termEditUrl);
    await termEditorPage.fillText(bodyText);
    await termEditorPage.save();

    //
    // Delete the term.
    //
    await page.goto(termEditUrl);
    await termEditorPage.delete();
    await termEditorPage.expectConfirm();
    await termEditorPage.confirmDelete();

    // Adjust this confirmation to your needs.
    await atkCommands.expectMessage(page, 'Deleted term');
  });
});

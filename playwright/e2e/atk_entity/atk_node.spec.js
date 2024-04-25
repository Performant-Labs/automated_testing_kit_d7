/**
 * atk_node.spec.js
 *
 * Validate node entities.
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
import qaUsers from '../data/qaUsers.json';

class EditorPage {
  constructor(page) {
    this.page = page;
    this.titleField = page.locator('#edit-title');
    this.textEditor = page.locator('.text-full');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.imageFileField = page.locator('#edit-field-image .form-file');
    this.imageAltField = page.locator('#edit-field-image .form-text');
    this.imageSubmitButton = page.locator('#edit-field-image .form-submit');
  }

  async fillTitle(title) {
    await this.titleField.fill(title);
  }

  async fillText(text) {
    await this.textEditor.fill(text);
  }

  async uploadImage(filepath, alt) {
    const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.imageFileField.click()
    ]);
    await fileChooser.setFiles(filepath);
    await this.imageSubmitButton.click();
    await this.imageAltField.fill(alt);
  }

  async save() {
    await this.saveButton.click();
  }
}

class ContentPage {
  constructor(page) {
    this.page = page;
    this.textContainer = page.locator('.field-name-body');
  }

  async expectText(text) {
    await expect(await this.textContainer.textContent()).toContain(text);
  }

  async getNid() {
    // Extract the nid placed in the body class by this hook:
    // automated_testing_kit.module:automated_testing_kit_preprocess_html().
    // Wait for the page to load
    await this.page.waitForLoadState('domcontentloaded');
    const bodyClass = await this.page.evaluate(() => document.body.className);
    const match = bodyClass.match(/page-node-(\d+)/);

    // Get the nid.
    return parseInt(match[1], 10);
  }
}

test.describe('Node tests.', () => {
  //
  // Create a page with an image, confirm it, update it, confirm update then delete it via the UI.
  //
  test('(ATK-PW-1110) Create, update, delete a page via the UI. @ATK-PW-1110 @node @smoke @alters-db', async ({ page, context }) => {
    const testId = 'ATK-PW-1110';
    let bodyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a ultrices tortor.';

    // Log in with the administrator account.
    // You should change this to an account other than the administrator,
    // which has all rights.
    await atkCommands.logInViaForm(page, context, qaUsers.admin);

    //
    // Add a page.
    //
    await page.goto(atkConfig.pageAddUrl);
    const editorPage = new EditorPage(page);

    // Fill in as many fields as you need here.
    await editorPage.fillTitle(`${testId}: A Title`);
    await editorPage.fillText(bodyText);
    await editorPage.save();

    //
    // Confirm content appears.
    //
    const contentPage = new ContentPage(page);
    await contentPage.expectText(bodyText);
    const nid = await contentPage.getNid();

    //
    // Update the node.
    //
    const nodeEditUrl = atkConfig.nodeEditUrl.replace('{nid}', nid);

    bodyText = 'Ut eget ex vitae nibh dapibus vulputate ut id lacus.';

    await page.goto(nodeEditUrl);
    await editorPage.fillText(bodyText);
    // Timeouts necessary when running at full speed.
    await page.waitForTimeout(1000);
    await editorPage.save();
    await page.waitForTimeout(1000);

    //
    // Confirm content has changed.
    //
    await contentPage.expectText(bodyText);

    //
    // Delete the node.
    //
    await atkCommands.deleteNodeViaUiWithNid(page, context, nid);
  });

  //
  // Create an article with an image, confirm it, update it, confirm update then delete it via the UI.
  //
  test('(ATK-PW-1111) Create, update, delete an article via the UI. @ATK-PW-1111 @node @smoke @alters-db', async ({ page, context }) => {
    const testId = 'ATK-PW-1111';
    const image1Filepath = 'tests/data/NewspaperArticle.jpg';
    const uniqueToken1 = atkUtilities.createRandomString(6);
    let bodyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a ultrices tortor.';

    // Log in with the administrator account.
    // You should change this to an account other than the administrator,
    // which has all rights.
    await atkCommands.logInViaForm(page, context, qaUsers.admin);

    //
    // Add an article.
    //
    await page.goto(atkConfig.articleAddUrl);
    const editorPage = new EditorPage(page);

    // Fill in as many fields as you need here.
    await editorPage.fillTitle(`${testId}: A Title`);

    // Upload image.
    await editorPage.uploadImage(image1Filepath, `${testId}: ${uniqueToken1}`);

    // Fill body.
    await editorPage.fillText(bodyText);
    await editorPage.save();

    //
    // Confirm content appears.
    //
    const contentPage = new ContentPage(page);
    await contentPage.expectText(bodyText);
    const nid = await contentPage.getNid();

    //
    // Update the node.
    //
    const nodeEditUrl = atkConfig.nodeEditUrl.replace('{nid}', nid);

    bodyText = 'Ut eget ex vitae nibh dapibus vulputate ut id lacus.';

    await page.goto(nodeEditUrl);
    await editorPage.fillText(bodyText);
    // Timeouts necessary when running at full speed.
    await page.waitForTimeout(1000);
    await editorPage.save();
    await page.waitForTimeout(1000);

    //
    // Confirm content has changed.
    //
    await contentPage.expectText(bodyText);

    //
    // Delete the node.
    //
    await atkCommands.deleteNodeViaUiWithNid(page, context, nid);
  });
});

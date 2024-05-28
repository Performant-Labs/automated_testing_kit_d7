/**
 * atk_media.spec.js
 *
 * Validate media entity.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands';
import * as atkUtilities from '../support/atk_utilities';

// Set up Playwright.
const { test, expect } = require('@playwright/test');

import playwrightConfig from '../../playwright.config';
const baseUrl = playwrightConfig.use.baseURL;

// Import ATK configuration.
import atkConfig from '../../playwright.atk.config';

// Holds standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUsers from '../data/qaUsers.json';

test.describe('Media tests.', () => {
  //
  // Create media with image, confirm it, update it, confirm update then delete it via the UI.
  //
  test('(ATK-PW-1130) Create, update, delete an image via the UI. @ATK-PW-1130 @media @smoke @alters-db', async ({ page, context }) => {
    const testId = 'ATK-PW-1130';
    const image1Filepath = 'tests/data/RobotsAtDesk.png';
    const image2Filepath = 'tests/data/SmokeTest.png';
    const uniqueToken1 = atkUtilities.createRandomString(6);
    const uniqueToken2 = atkUtilities.createRandomString(6);

    // Log in with the administrator account.
    // You should change this to an account other than the administrator,
    // which has all rights.
    await atkCommands.logInViaForm(page, context, qaUsers.admin);

    //
    // Add an image.
    //
    await page.goto(baseUrl + atkConfig.mediaAddUrl);

    // Upload image.
    await page.setInputFiles('[name="files[upload]"]', image1Filepath);
    await page.click('#edit-next');

    // Fill in as many fields as you need
    // if you've customized your media entity.
    const altField = page.locator('#edit-field-file-image-alt-text-und-0-value');
    await altField.fill(`${testId}: ${uniqueToken1}`);

    // Uncomment to unpublish.
    // const publishInput = page.locator('input[name="status[value]"]'); // eslint-disable-line no-unused-vars
    // await publishInput.uncheck()

    // Then save the entity.
    await page.getByRole('button', { name: 'Save' }).click();

    // We are now on the media content list. Confirm the image
    // was rendered by checking for the token.
    // TODO not working in D7?
    // let imageLocator = page.locator(`img[alt*="${uniqueToken1}"]`);
    // await expect(imageLocator).toBeVisible();

    // Confirm image downloads correctly by testing the naturalWidth
    // and NaturalHeight properties.
    // let isImageDownloaded = await imageLocator.evaluate((img) => img.naturalWidth > 0 && img.naturalHeight > 0);

    // Extract the media id from the page URL.
    const url = page.url();
    const match = url.match(/fid=(\d+)/);
    expect(match).toBeTruthy();
    const mid = match[1];

    //
    // Update the media.
    //
    const mediaEditUrl = atkConfig.mediaEditUrl.replace('{mid}', mid);
    await page.goto(baseUrl + mediaEditUrl);
    await page.setInputFiles('[name="files[replace_upload]"]', image2Filepath);
    await altField.fill(`${testId}: ${uniqueToken2}`);
    await page.getByRole('button', { name: 'Save' }).click();

    //
    // Confirm content has changed.
    //

    // We are back again on the media content list. Confirm the image
    // was rendered by checking for the token.
    const imageLocator = page.locator('.content img');
    await expect(imageLocator).toBeVisible();

    // Confirm image downloads correctly by testing the naturalWidth
    // and NaturalHeight properties.
    const isImageDownloaded = await imageLocator.evaluate((img) => img.naturalWidth > 0 && img.naturalHeight > 0); // eslint-disable-line no-unused-vars
    expect(isImageDownloaded).toBeTruthy();

    //
    // Delete the media entity.
    //
    await page.goto(baseUrl + mediaEditUrl);
    await page.getByRole('button', { name: 'Delete' }).click();
    expect(await page.content()).toContain('Are you sure');
    await page.getByRole('button', { name: 'Delete' }).click();
  });
});

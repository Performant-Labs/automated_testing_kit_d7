/**
 * atk_page_error.spec.js
 *
 * Page error tests such as 4xx, 5xx, etc.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands';
import * as atkUtilities from '../support/atk_utilities';

// Set up Playwright.
const { test, expect } = require('@playwright/test');

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../data/qaUsers.json';

test.describe('Page error tests.', () => {
  //
  // Validate that 403 page appears.
  // Assumes:
  // Create a basic page with alias of "403-error-page" that has the
  // text "403 Error Page".
  // admin/config/system/site-information:Default 403 (access denied) page = /403-error-page
  //
  test('(ATK-PW-1060) Validate that 403 page appears. @ATK-PW-1060 @page-error @smoke', async ({ page, context }) => {
    const testId = 'ATK-PW-1060'; // eslint-disable-line no-unused-vars
    const badAnonymousUrl = '/admin';

    await atkCommands.logOutViaUi(page);
    await page.goto(badAnonymousUrl);

    // Should see the 403 message.
    let textContent = '';
    textContent = await page.content();
    expect(textContent).toContain('403 Error Page');
  });

  // Validate that 404 page appears.
  // Assumes:
  // Create a basic page with the alias of "404-error-page" that has the
  // text "404 Error Page".
  // In admin/config/system/site-information, set Default 404 (not found) page =  /404-error-page.
  // where x is the new node ID.
  test('(ATK-PW-1061) Validate that 404 page appears. @ATK-PW-1061 @page-error @smoke', async ({ page, context }) => {
    const testId = 'ATK-PW-1061';
    const randomString = atkUtilities.createRandomString(6);
    const badAnonymousUrl = `/${testId}-BadAnonymousPage-${randomString}`;
    const badAuthenticatedUrl = `/${testId}-BadAuthenticatedPage-${randomString}`;

    await atkCommands.logOutViaUi(page);
    await page.goto(`${badAnonymousUrl}`);

    // Should see the 404 message.
    let textContent = '';
    textContent = await page.content();
    expect(textContent).toContain('ATK 404 Error Page');

    await atkCommands.logInViaForm(page, context, qaUserAccounts.authenticated);
    await page.goto(badAuthenticatedUrl);

    // Should see the 404 message.
    textContent = await page.content();
    expect(textContent).toContain('ATK 404 Error Page');
  });
});

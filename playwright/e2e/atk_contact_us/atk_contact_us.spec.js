/**
 * atk_contact_us.spec.js
 *
 * Contact Us tests.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands';
import * as atkUtilities from '../support/atk_utilities';
// Import ATK Configuration.
import atkConfig from '../../playwright.atk.config';

// Import email settings for Ethereal fake SMTP service.
import userEtherealAccount from '../data/etherealUser.json';

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUsers from '../data/qaUsers.json';

// Set up Playwright.
const { test, expect } = require('@playwright/test');

test.describe('Contact Us tests.', () => {
  //
  // Validate Contact us.
  //
  test('(ATK-PW-1050)  Contact Us form accepts input, sends email. @ATK-PW-1050 @contact-us @smoke @alters-db', async ({ page, context }) => {
    const uniqueToken = atkUtilities.createRandomString(6);
    const testId = '(ATK-PW-1050)';
    const subjectLine = `${testId} ${uniqueToken}`;

    // Add permission
    atkCommands.addRolePerm('anonymous user', 'access site-wide contact form');

    // Begin registration.
    await page.goto(atkConfig.contactUsUrl);

    await page.getByLabel('Your name').fill(uniqueToken);
    await page.getByLabel('Your e-mail').fill(`${uniqueToken}@example.com`);
    await page.getByLabel('Subject').fill(subjectLine);
    await page.getByLabel('Message').fill(testId);
    await page.getByRole('button', { name: 'Send message' }).click();
    await atkCommands.expectMessage(page, 'Your message has been sent.');

    // Check for Contact Us email at Ethereal.
    await atkCommands.checkEmail(page, null, subjectLine);
  });
});

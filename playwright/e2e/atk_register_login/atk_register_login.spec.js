/**
 * atk_register_login.spec.js
 *
 * Registration, login and forgotten password tests.
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands';
import * as atkUtilities from '../support/atk_utilities';

// Set up Playwright.
const { test, expect } = require('@playwright/test');

import playwrightConfig from '../../playwright.config';

const baseUrl = playwrightConfig.use.baseURL;

// Import ATK Configuration.
import atkConfig from '../../playwright.atk.config';

// Import email settings for Ethereal fake SMTP service.
import userEtherealAccount from '../data/etherealUser.json';

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../data/qaUsers.json';

test.describe('User registration and login tasks.', () => {
  //
  // Register the Ethereal user and confirm email reaches Ethereal.
  //
  test('(ATK-PW-1000) Register with form and confirm email with Ethereal. @ATK-PW-1000 @register-login @alters-db @smoke', async ({ page }) => {
    let textContent = null;

    // Clean up user in case it exists. Use email because we modify the name
    // to make it easier to find the registration email in Ethereal.email.
    atkCommands.deleteUserWithEmail(userEtherealAccount.userEmail, ['--delete-content']);

    // Begin registration.
    await page.goto(baseUrl + atkConfig.registerUrl);

    await page.getByLabel('Email address').fill(userEtherealAccount.userEmail);
    const extendedUserName = `${userEtherealAccount.userName}-${atkUtilities.createRandomString(6)}`;
    await page.getByLabel('Username').fill(extendedUserName);
    await page.getByRole('button', { name: 'Create new account' }).click();

    // The status box needs a moment to appear.
    await page.waitForSelector('[aria-label="Status message"]');

    // Should see the thank-you message.
    textContent = await page.content();
    expect(textContent).toContain('Thank you for applying for an account.');

    // Give the email some time to arrive, adjust as needed.
    await page.waitForTimeout(1000);

    // Check for registration email at Ethereal.
    const etherealUrl = 'https://ethereal.email';
    await page.goto(`${etherealUrl}/login`);
    await page.getByPlaceholder('Enter email').fill(userEtherealAccount.userEmail);
    await page.getByPlaceholder('Password').fill(userEtherealAccount.userPassword);
    await page.getByRole('button', { name: 'Log in' }).click();

    textContent = await page.textContent('body');
    expect(textContent).toContain(`Logged in as ${userEtherealAccount.userEmail}`);

    await page.goto(`${etherealUrl}/messages`);

    textContent = await page.textContent('body');
    expect(textContent).toContain(`Messages for ${userEtherealAccount.userEmail}`);

    // There may be two emails, one for the user and one for the admin.
    // Look for email in the first column and the username + userCode generated above
    // in the second column; that's the user email.
    const toValue = `To: <${userEtherealAccount.userEmail}>`;
    const subjectValue = `Account details for ${extendedUserName}`;
    await expect(page.getByRole('row', { name: `${toValue} ${subjectValue}` })).toBeVisible;

    // Clean up user.
    atkCommands.deleteUserWithEmail(userEtherealAccount.userEmail, ['--delete-content']);
  });

  //
  // Log in with the login form into the authenticated account.
  //
  test('(ATK-PW-1010) Log in via login form. @ATK-PW-1010 @register-login @smoke', async ({ page, context }) => {
    await atkCommands.logInViaForm(page, context, qaUserAccounts.authenticated);
  });

  //
  // Log in with a POST request into the authenticated account.
  //
  test('(ATK-PW-1011) Log in via POST. @ATK-PW-1011 @register-login @smoke', async ({ page }) => { // eslint-disable-line no-unused-vars
    // TODO: Not ready yet.
    // await atkCommands.logInViaPost(page, context, request, qaUserAccounts.authenticated)
  });

  //
  // Log in with a ULI generated by Drupal.
  //
  test('(ATK-PW-1012) Log in via ULI. @ATK-PY-1012 @register-login @smoke', async ({ page, context }) => {
    await atkCommands.logInViaUli(page, context, 1);
  });

  //
  // Validate reset password function.
  //
  test('(ATK-PW-1030) Reset password. @ATK-PW-1030 @register-login @smoke', async ({ page }) => {
    await atkCommands.deleteUserWithEmail(userEtherealAccount.userEmail, ['--delete-content']);

    // Use random string to identify user in Ethereal.email.
    const extendedUserName = `${userEtherealAccount.userName}-${atkUtilities.createRandomString(6)}`;

    const resetAccount = {
      userName: extendedUserName,
      userEmail: userEtherealAccount.userEmail,
      userPassword: userEtherealAccount.userPassword,
      userRoles: [],
    };
    await atkCommands.createUserWithUserObject(resetAccount, []);

    // Begin registration.
    await page.goto(baseUrl + atkConfig.resetPasswordUrl);

    await page.getByLabel('Username').fill(extendedUserName);
    await page.getByRole('button', { name: 'Submit' }).click();

    // The status box needs a moment to appear.
    await page.waitForSelector('[aria-label="Status message"]');

    // Check for tail end of reset message.
    let textContent = await page.content();
    expect(textContent).toContain('an email will be sent with instructions to reset your password.');

    // Give the email some time to arrive.
    await page.waitForTimeout(1000);

    // Check for registration email at Ethereal.
    const etherealUrl = 'https://ethereal.email';
    await page.goto(`${etherealUrl}/login`);
    await page.getByPlaceholder('Enter email').fill(resetAccount.userEmail);
    await page.getByPlaceholder('Password').fill(resetAccount.userPassword);
    await page.getByRole('button', { name: 'Log in' }).click();

    textContent = await page.textContent('body');
    expect(textContent).toContain(`Logged in as ${userEtherealAccount.userEmail}`);

    await page.goto(`${etherealUrl}/messages`);

    textContent = await page.textContent('body');
    expect(textContent).toContain(`Messages for ${userEtherealAccount.userEmail}`);

    // There may be two emails, one for the user and one for the admin.
    // Look for email in the first column and the username + userCode generated above
    // in the second column; that's the user email.
    const toValue = `To: <${userEtherealAccount.userEmail}>`;
    const subjectValue = `Replacement login information for ${extendedUserName}`;
    await expect(page.getByRole('row', { name: `${toValue} ${subjectValue}` })).toBeVisible;

    const uid = await atkCommands.getUidWithEmail(userEtherealAccount.userEmail);
    await atkCommands.deleteUserWithUid(uid, [], ['--delete-content']);
  });
});

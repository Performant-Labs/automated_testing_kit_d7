/**
 * atk_user.spec.js
 *
 * Validate user entity.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import * as atkCommands from '../support/atk_commands';
import * as atkUtilities from '../support/atk_utilities'; // eslint-disable-line no-unused-vars

// Set up Playwright.
const { test } = require('@playwright/test');

import playwrightConfig from '../../playwright.config';

const baseUrl = playwrightConfig.use.baseURL; // eslint-disable-line no-unused-vars

// Import ATK configuration.
import atkConfig from '../../playwright.atk.config'; // eslint-disable-line no-unused-vars

// Import email settings for Ethereal fake SMTP service.
import userEtherealAccount from '../data/etherealUser.json';

// Holds standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../data/qaUsers.json'; // eslint-disable-line no-unused-vars

test.describe('User tests.', () => {
  //
  // Create a user with Drush from a fixture and delete it.
  //
  test('(ATK-PW-1100) Create and delete user with Drush. @ATK-PW-1100 @user @drush @smoke @alters-db', async ({ page }) => { // eslint-disable-line no-unused-vars
    const testId = 'ATK-PW-1100'; // eslint-disable-line no-unused-vars

    await atkCommands.deleteUserWithEmail(userEtherealAccount.userEmail, ['--delete-content']);
    await atkCommands.createUserWithUserObject(userEtherealAccount, []);
    await atkCommands.deleteUserWithUserName(userEtherealAccount.userName, [], ['--delete-content']);
  });

  //
  // Create a user with Drush from a fixture and delete it by UID.
  //
  test('(ATK-PW-1101) Create user with Drush, delete by UID.  @ATK-PW-1101 @user @drush @smoke @alters-db ', async ({ page }) => { // eslint-disable-line no-unused-vars
    await atkCommands.deleteUserWithEmail(userEtherealAccount.userEmail, ['--delete-content']);
    await atkCommands.createUserWithUserObject(userEtherealAccount, []);
    const uid = await atkCommands.getUidWithEmail(userEtherealAccount.userEmail);
    await atkCommands.deleteUserWithUid(uid, [], ['--delete-content']);
  });
});

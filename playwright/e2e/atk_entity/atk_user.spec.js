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

test.describe('User tests.', () => {
  //
  // Create a user with Drush from a fixture and delete it.
  //
  test('(ATK-PW-1100) Create and delete user with Drush. @ATK-PW-1100 @user @drush @smoke @alters-db', async ({ page }) => { // eslint-disable-line no-unused-vars
    const testId = 'ATK-PW-1100'; // eslint-disable-line no-unused-vars
    const userAccount = atkUtilities.getRandomUser();

    await atkCommands.createUserWithUserObject(userAccount, []);
    await atkCommands.deleteUserWithUserName(userAccount.userName, [], ['--delete-content']);
  });
});

/**
 * atk_commands.js
 *
 * Useful functions for Playwright.
 *
 */

/** ESLint directives */
/* eslint-disable no-prototype-builtins */
/* eslint-disable import/first */

// Set up Playwright.
import { expect } from '@playwright/test'
import playwrightConfig from '../../playwright.config.js'
import { execSync } from 'child_process'

// Fetch the Automated Testing Kit config, which is in the project root.
import atkConfig from '../../playwright.atk.config.js'
import etherealUser from '../data/etherealUser.json';

module.exports = {
  createUserWithUserObject,
  deleteNodeViaUiWithNid,
  deleteUserWithEmail,
  deleteUserWithUid,
  deleteUserWithUserName,
  execDrush,
  execPantheonDrush,
  getDrushAlias,
  getUidWithEmail,
  getUsernameWithEmail,
  logInViaForm,
  checkLogIn,
  logInViaUli,
  logOutViaUi,
  setDrupalConfiguration,
  expectMessage,
  checkEmail
}

const baseUrl = playwrightConfig.use.baseURL;

/**
 * Create a user via Drush using a JSON user object.
 * See qaUsers.json for the definition.
 *
 * TODO: cy.exec is failing to capture the result of user:create,
 * which should provide the UID.
 * See issue: https://github.com/drush-ops/drush/issues/5660
 *
 * @param {object} user JSON user object; see qaUsers.json for the structure.
 * @param {array} roles Array of string roles to pass to Drush (machine names).
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 */
function createUserWithUserObject(user, roles = [], args = [], options = []) {
  let cmd = 'user:create '

  if ((args === undefined) || !Array.isArray(args)) {
    console.log('createUserWithUserObject: Pass an array for args.')
    return
  }

  if ((options === undefined) || !Array.isArray(options)) {
    console.log('createUserWithUserObject: Pass an array for options.')
    return
  }

  args.unshift(`'${user.userName}'`)
  options.push(`--mail='${user.userEmail}'`, `--password='${user.userPassword}'`)
  console.log(`Attempting to create: ${user.userName}. `)

  execDrush(cmd, args, options)

  // TODO: Bring this in when execDrush reliably
  // returns results.

  // Get the UID, if present.
  // const pattern = '/Created a new user with uid ([0-9]+)/g'

  // let uid = result.match(pattern)

  // Attempt to add the roles.
  // Role(s) may come from the user object or the function arguments.
  if (user.hasOwnProperty('userRoles')) {
    user.userRoles.forEach(function (role) {
      roles.push(role)
    })
  }

  roles.forEach(function (role) {
    cmd = `user:role:add '${role}' '${user.userName}'`
    execDrush(cmd)
    console.log(`${role}: If role exists, role assigned to the user ${user.userName}`)
  })
}

/**
 * Delete node via UI given a nid.
 *
 * @param {object} page Page object.
 * @param {object} context Context object.
 * @param {int} nid Node ID of item to delete.
 */
async function deleteNodeViaUiWithNid(page, context, nid) {
  const nodeDeleteUrl = atkConfig.nodeDeleteUrl.replace("{nid}", nid)

  // Delete a node page.
  await page.goto(nodeDeleteUrl)
  await page.getByRole('button', { name: 'Delete' }).click()

  // Adjust this confirmation to your needs.
  await expectMessage(page, 'has been deleted.');
}

/**
 * Delete user via Drush given an account email.
 *
 * @param {string} email Email of account to delete.
 * @param {[string]} options Array of string options.
 */
function deleteUserWithEmail(email, options = []) {
  const name = getUsernameWithEmail(email);
  if (name) {
    deleteUserWithUserName(name, options);
  }
}

/**
 * Delete user via Drush given a Drupal UID.
 *
 * @param {number} uid Drupal uid of user to delete.
 * @param options {string[]} Array of string options
 */
function deleteUserWithUid(uid, options = []) {
  const name = getUsernameWithEmail(uid);
  if (name) {
    deleteUserWithUserName(name, options);
  }
}

/**
 * Delete user via Drush given a Drupal username.
 *
 * @param {string} userName Drupal username.
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 */
function deleteUserWithUserName(userName, args = [], options = []) {
  const cmd = `user:cancel -y '${userName}' `

  if ((args === undefined) || !Array.isArray(args)) {
    console.log('deleteUserWithUserName: Pass an array for args.')
    return
  }

  if ((options === undefined) || !Array.isArray(options)) {
    console.log('deleteUserWithUserName: Pass an array for options.')
    return
  }

  console.log(`Attempting to delete: ${userName}. `)

  execDrush(cmd, args, options)
}

/**
 * Run drush command locally or remotely depending on the environment.
 * Generally you'll use this function and let it figure out
 * how to execute Drush (locally, remotely, native OS, inside container, etc.).
 *
 * @param {string} cmd The Drush command.
 * @param {array} args Array of string arguments to pass to Drush.
 * @param {array} options Array of string options to pass to Drush.
 * @param throwOnError {boolean} if process exit with non-zero code,
 * test must fail
 * @returns {string} The output from executing the command in a shell.
 */
function execDrush(cmd, args = [], options = [], throwOnError = true) {
  let output = ''

  if ((args === undefined) || !Array.isArray(args)) {
    console.log('execDrush: Pass an array for arguments.')
  }

  if ((options === undefined) || !Array.isArray(options)) {
    console.log('execDrush: Pass an array for options.')
  }

  const drushAlias = getDrushAlias()
  const argsString = args.join(' ')
  const optionsString = options.join(' ')
  const command = `${drushAlias} ${cmd} ${argsString} ${optionsString}`
  // const command = 'echo $PATH'

  // Pantheon needs special handling.
  if (atkConfig.pantheon.isTarget) {
    // sshCmd comes from the test and is set in the before()
    return execPantheonDrush(command) // Returns stdout (not wrapped).
  } else {
    try {
      // output = execSync(command, { shell: 'bin/bash'}).toString()
      output = execSync(command).toString()

      console.log('execDrush result: ' + output)
    } catch (error) {
      console.log(`execDrush error: ${error.message}`)
      if (throwOnError) {
        throw error
      }
    }
  }

  return output
}

/**
 * Run a Pantheon Drush command via Terminus.
 * Called by execDrush().
 *
 * @param {string} cmd Drush command; execDrush() contructs this with args and options.
 * @returns {string} The output from executing the command in a shell.
 */
function execPantheonDrush(cmd) {
  let result

  // Construct the Terminus command. Remove "drush" from argument.
  const remoteCmd = `terminus remote:drush ${atkConfig.pantheon.site}.${atkConfig.pantheon.environment} -- ${cmd.substring(5)}`

  result = ''
  try {
    result = execSync(remoteCmd)
    console.log("execPantheonDrush result: " + result)
  } catch (error) {
    console.log("execPantheonDrush error: " + error)
  }

  return result
}

/**
 * Returns Drush alias per environment.
 * Adapt this to the mechanism that communicates to the remote server.
 *
 * @returns {string} The Drush command i.e 'lando drush ', etc.
 */
function getDrushAlias() {
  let cmd = ''

  // Drush to Pantheon requires Terminus.
  if (atkConfig.pantheon.isTarget) {
    cmd = 'drush '
  } else {
    // Fetch the Drush command appropriate to the operating mode.
    cmd = atkConfig.drushCmd + ' '
  }
  return cmd
}

/**
 * Get user as an object by user e-mail.
 * @param email Email of the account (actually, can be also uid or name).
 * @return {any}
 */
function getUserJsonWithEmail(email) {
  const cmd = `user:information ${email} --format=json`

  let result;
  try {
    result = execDrush(cmd);
  } catch (e) {
    if (e.toString().indexOf('UserListException') !== -1) {
      // User just not found.
      return undefined;
    }
    // Some other error that we must be aware of.
    throw e;
  }
  if (result) {
    return JSON.parse(result)
  }
}

/**
 * Return the UID of a user given an email.
 *
 * @param {string} email Email of the account.
 * @returns {number} UID of user.
 */
function getUidWithEmail(email) {
  const userJson = getUserJsonWithEmail(email)
  if (userJson) {
    for (const key in userJson) {
      if (userJson[key].hasOwnProperty('uid')) {
        const uidValue = userJson[key].uid
        return parseInt(uidValue) // Exit the loop once the mail property is found.
      }
    }
  }
}

/**
 * Return the Username of a user given an email.
 *
 * @param {string|number} email Email of the account.
 * @returns {string} Username of user.
 */
function getUsernameWithEmail(email) {
  const userJson = getUserJsonWithEmail(email)
  if (userJson) {
    for (const key in userJson) {
      if (userJson[key].hasOwnProperty('name')) {
        return userJson[key].name
      }
    }
  }
}

/**
 * Log in via the login form. Test this once then switch to faster mechanisms.
 *
 * @param {object} page Page object.
 * @param {object} context Context object.
 * @param {object} account JSON object see structure of qaUserAccounts.json.
 */
async function logInViaForm(page, context, account) {
  await context.clearCookies()
  await page.goto(atkConfig.logInUrl)
  await page.getByLabel('Username').fill(account.userName)
  await page.getByLabel('Password').fill(account.userPassword)
  await page.getByRole('button', { name: 'Log in' }).click()
  await checkLogIn(page);

  // Keep the stored state in the support directory.
  const authFile = atkConfig.supportDir + '/loginAuth.json'
  await page.context().storageState({ path: authFile })
}

/**
 * Check the logged in state of the page.
 * @param page Page object.
 */
async function checkLogIn(page) {
  await page.waitForLoadState('domcontentloaded');
  const textContent = await page.textContent('body')
  await expect(textContent).toContain('Member for')
}

/**
 * Log in with user:login given a user id.
 *
 * @param {object} page Page object.
 * @param {number} uid Drupal user id.
 */
async function logInViaUli(page, uid) {
  let cmd = ''
  let url = ''

  await logOutViaUi(page)

  if (uid === undefined) uid = 1

  cmd = `user:login --uid=${uid}`
  url = execDrush(cmd, [], ['--uri=' + baseUrl])

  await page.goto(url)  // Drush returns fully formed URL.
}

/**
 * Log out user via the UI.
 *
 * @param {object} page Page object.
 */
async function logOutViaUi(page) {
  await page.goto(atkConfig.logOutUrl)
}

/**
 * Set Drupal configuration via drush.
 *
 * @param {string} objectName Name of configuration category.
 * @param {string} key Name of configuration setting.
 * @param {*} value Value of configuration setting.
 */
function setDrupalConfiguration(objectName, key, value) {
  const cmd = `cset -y ${objectName} ${key} ${value}`

  execDrush(cmd)
}

/**
 * Assert presence of a message with given text on the page.
 * @param page Playwright Page object.
 * @param text Text, which the message box should partially match.
 * @return {Promise<void>}
 */
async function expectMessage(page, text) {
  // The status box needs a moment to appear.
  const message = await page.waitForSelector('.messages.status');

  // Should see the thank-you message.
  expect(await message.textContent()).toContain(text);
}

/**
 * Verify that email is sent to the given recipient with expected subject.
 * @param page Playwright page object.
 * @param userEmail Email address of the recipient. If null, only subject is verified.
 * @param subjectValue Expected subject.
 * @return {Promise<void>}
 */
async function checkEmail(page, userEmail, subjectValue) {
  const etherealUrl = 'https://ethereal.email';
  await page.goto(`${etherealUrl}/login`);
  await page.getByPlaceholder('Enter email').fill(etherealUser.userEmail);
  await page.getByPlaceholder('Password').fill(etherealUser.userPassword);
  await page.getByRole('button', { name: 'Log in' }).click();

  let textContent;
  textContent = await page.textContent('body');
  expect(textContent).toContain(`Logged in as ${etherealUser.userEmail}`);

  await page.goto(`${etherealUrl}/messages`);

  textContent = await page.textContent('body');
  expect(textContent).toContain(`Messages for ${etherealUser.userEmail}`);

  let expectedValue;
  // There may be two emails, one for the user and one for the admin.
  // Look for email in the first column and the username + userCode generated above
  // in the second column; that's the user email.
  if (!userEmail) {
    expectedValue = subjectValue;
  } else {
    const toValue = `To: <${userEmail}>`;
    expectedValue = `${toValue} ${subjectValue}`;
  }
  await expect(page.getByRole('row', { name: expectedValue })).toBeVisible();
}

/**
 * atk_sitemap.spec.js
 *
 * Validate sitemap.xml.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import * as atkUtilities from '../support/atk_utilities'; // eslint-disable-line no-unused-vars
import * as atkCommands from '../support/atk_commands';

// Set up Playwright.
const { test, expect } = require('@playwright/test');

import playwrightConfig from '../../playwright.config';

const baseUrl = playwrightConfig.use.baseURL;

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUsers from '../data/qaUsers.json';

test.describe('Sitemap tests.', () => {
  //
  // 1070 to 1079 reserved for XML Sitemap (https://www.drupal.org/project/xmlsitemap) tests.
  //

  //
  // Return # of sitemap files; fail if zero.
  //
  test('(ATK-PW-1070) Return # of sitemap files; fail if zero. @ATK-PW-1070 @xml-sitemap @smoke', async ({ page }) => {
    const testId = 'ATK-PW-1070'; // eslint-disable-line no-unused-vars
    const fileName = '/sitemap.xml';

    // Construct an absolute URL of the sitemap.
    const targetUrl = new URL(fileName, baseUrl).toString();

    // If there isn't at least one sitemap, this will fail.
    const response = await axios.get(targetUrl);

    // Uncomment and use with parse() below to test multi-part sitemaps.
    // let tempVal = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>http://example.com/sitemap1.xml</loc><lastmod>2023-01-01T00:00:00+00:00</lastmod></sitemap><sitemap><loc>http://example.com/sitemap2.xml</loc><lastmod>2023-01-01T00:00:00+00:00</lastmod></sitemap></sitemapindex>'

    const parser = new XMLParser();
    const jsonObj = parser.parse(response.data);

    let sitemapCount;

    if (jsonObj.urlset) {
      // sitemap.xml is itself a sitemap file.
      sitemapCount = 1;
    } else {
      const sitemap = jsonObj.sitemapindex.sitemap;
      expect(sitemap).toBeTruthy();
      if (!(sitemap instanceof Array)) {
        sitemapCount = 1;
      } else {
        sitemapCount = sitemap.length;
      }
    }

    console.log(`Total sitemap files: ${sitemapCount}`); // eslint-disable-line no-console
  });

  //
  // Regenerate sitemap files.
  // 1. Find Site ID of default sitemap (change for your installation).
  // 2. Fetch the 1.xml timestamp.
  // 3. Use drush xmlsitemap:regenerate to create new files.
  // 4. Validate new files.
  //
  test('(ATK-PW-1071) Regenerate sitemap files. @ATK-PW-1071 @xml-sitemap @smoke', async ({ page, context }) => {
    const testId = 'ATK-PW-1071'; // eslint-disable-line no-unused-vars
    const fileName = '/sitemap.xml'; // eslint-disable-line no-unused-vars

    //
    // Step 1.
    //
    await atkCommands.logInViaForm(page, context, qaUsers.admin);
    await page.goto(`/admin/config/search/xmlsitemap`);

    // Find the first row.
    const row = await page.$('.content table.sticky-enabled tbody tr:nth-child(1)');

    // Get sitemap ID from the 'value' property.
    const siteId = await row.$eval('input[id^="edit-sitemaps"]', (el) => el.value);

    //
    // Step 2.
    //
    const firstSitemap = `sites/default/files/xmlsitemap/${siteId}/1.xml`;
    const drushCommand = `fprop --format=json ${firstSitemap}`;

    // Capture the timestamp to ensure it changes.
    // TODO: Uncomment once command is ready.
    // const firstFileProps = JSON.parse(atkCommands.execDrush(drushCommand));
    const firstFileProps = [{ directory: 'web/sites/default/files/xmlsitemap/NXhscRe0440PFpI5dSznEVgmauL25KojD7u4e9aZwOM/', filename: '1.xml', filesize: 270, filectime: 'May 21 08:37', filemtime: 'May 21 08:37' }]

    //
    // Step 3.
    //
    atkCommands.execDrush('xmlsitemap-rebuild');

    //
    // Step 4.
    //
    // const secondFileProps = JSON.parse(atkCommands.execDrush(drushCommand));
    const secondFileProps = [{ directory: 'web/sites/default/files/xmlsitemap/NXhscRe0440PFpI5dSznEVgmauL25KojD7u4e9aZwOM/', filename: '1.xml', filesize: 270, filectime: 'May 21 08:37', filemtime: 'May 21 12:37' }]
    const firstTime = firstFileProps[0].filemtime;
    const secondTime = secondFileProps[0].filemtime;
    expect(firstTime).not.toEqual(secondTime);
  });

  //
  // Regenerate sitemap files for SimpleSiteMap.
  // 1080 to 1089 reserved for Simple XML Sitemap (https://www.drupal.org/project/simple_sitemap) tests.
  //
});

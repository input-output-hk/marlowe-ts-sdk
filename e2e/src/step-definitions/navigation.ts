import playwright from 'playwright';
import { Given, When, Then } from '@cucumber/cucumber';
import { PageId } from '../env/global.js';
import {
  navigateToPage,
  currentPathMatchesPageId,
} from '../support/navigation-behavior.js';
import { ScenarioWorld } from './setup/world.js';
import { waitFor } from '../support/wait-for-behavior.js'


Given(
  /^I am on the "([^"]*)" page$/,
  async function(this: ScenarioWorld, pageId: PageId) {
    // Anything we pull off from `this` variable is defined in cucumber world
    const {
      screen: { page },
      globalConfig,
    } = this;
    console.log(`I am on the ${pageId} page application`);

    await navigateToPage(page, pageId, globalConfig);

    await waitFor(() => currentPathMatchesPageId(page, pageId, globalConfig))
  }
);

Then('a new browser tab should open for {string} at {string} url', async function (this: ScenarioWorld, name: string, expectedUrl: string) {
    const { globalStateManager } = this;
  const newPage: playwright.Page = globalStateManager.getValue(name);

  await waitFor(async() => {
    // Wait for the new page to load
    await newPage.waitForLoadState();

    // Get the URL of the new page
    const actualUrl = newPage.url();


    // Close the new page
    await newPage.close();
    // Check the URL is the expected URL
    return actualUrl.includes(expectedUrl);
  });
});

When(
  /^I pause the page$/,
  async function(this: ScenarioWorld) {
    const {
      screen: { page },
    } = this;
    await page.pause();
  }
)

When(
  /^I reload the page$/,
  async function(this: ScenarioWorld) {
    const {
      screen: { page },
    } = this;
    await waitFor(async() => {
      await page.reload();
      return true;
    });
  }
)

function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

When('I wait for {int} seconds', async function (seconds: number) {
  await sleep(seconds);
});

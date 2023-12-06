import playwright from 'playwright';
import { When } from '@cucumber/cucumber';
import { ScenarioWorld } from './setup/world.js';
import { ValidAccessibilityRoles } from '../env/global.js';
import { waitFor } from "../support/wait-for-behavior.js";

When(
  /^I click the "([^"]*)" with "([^"]*)" text$/,
  async function(this: ScenarioWorld, role: ValidAccessibilityRoles, name: string) {
    const {
      screen: { page },
      globalStateManager
    } = this;

    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });
  }
);

When(
  /^I click the first "([^"]*)" with "([^"]*)" text$/,
  async function(this: ScenarioWorld, role: ValidAccessibilityRoles, name: string) {
    const {
      screen: { page },
      globalStateManager
    } = this;
    await waitFor(async () => {
      const tableLocator = page.locator('table');

      const locator = await tableLocator.locator(`${role}:nth-of-type(1)`).nth(0);
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });
  }
);

When(
  /^I click the new tab "link" with "([^"]*)" text$/,
  async function(this: ScenarioWorld,  name: string) {
    const {
      screen: { page },
      globalStateManager
    } = this;

    let newPagePromise;

    newPagePromise = new Promise(resolve => page.context().once('page', resolve));

    await waitFor(async() => {
      const locator = await page.getByRole("link", { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    // Await for new page to popup and store it in the global state manager
    const newPage = await newPagePromise as playwright.Page;
    globalStateManager.appendValue(name, newPage);
  }
);



When(
  /^I click the "([^"]*)" (?:button|link)$/,
  async function(this: ScenarioWorld, name: string, role: ValidAccessibilityRoles) {
    const {
      screen: { page },
    } = this;

    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });
  }
)

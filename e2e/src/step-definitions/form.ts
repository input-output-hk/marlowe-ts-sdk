import fs from 'fs';
import path from 'path';
import { When } from "@cucumber/cucumber";
import { ScenarioWorld } from './setup/world.js';
import { getElementLocator } from '../support/web-element-helper.js';
import { ElementKey } from '../env/global.js';
import { ValidAccessibilityRoles } from '../env/global.js';
import { waitFor } from "../support/wait-for-behavior.js";
import {
  inputValue,
} from '../support/html-behavior.js';


When(
  /^I fill in the "([^"]*)" input with "([^"]*)"$/,
  async function(this: ScenarioWorld, elementKey: ElementKey, input: string) {
    const {
      screen: { page },
      globalConfig
    } = this;

    const elementIdentifier = getElementLocator(page, elementKey, globalConfig);
    const { role, name } = elementIdentifier;

    await waitFor(async() => {
      const locator = await page.getByRole(role as ValidAccessibilityRoles, { name })
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, input);
        return result;
      }
    });
  }
)

When(
  /^I unblur the "([^"]*)" input$/,
  async function(this: ScenarioWorld, elementKey: ElementKey) {
    const {
      screen: { page },
      globalConfig
    } = this;

    const elementIdentifier = getElementLocator(page, elementKey, globalConfig);
    const { role, name } = elementIdentifier;

    await waitFor(async() => {
      const locator = await page.getByRole(role as ValidAccessibilityRoles, { name })
      const result = await locator.isVisible();

      if (result) {
        await locator.blur();
        return result;
      }
    });
  }
)

When('I press {string} on the keyboard {string} times', async function (this: ScenarioWorld, keyName: string, numberOfTimes: string) {
  const {
    screen: { page },
  } = this;


  await waitFor(async() => {
    const times = parseInt(numberOfTimes, 10);
    for (let i = 0; i < times; i++) {
      await page.keyboard.press(keyName);
    }
    return true;
  });
});

When('I enter the contents of {string} into the {string} field',
  async function (this: ScenarioWorld, fileName: string, name: string) {
    const {
      screen: { page },
      globalConfig,
      globalStateManager
    } = this;

    const role = "textbox";

    await waitFor(async() => {
      const locator = await page.getByRole(role as ValidAccessibilityRoles, { name })
      const result = await locator.isVisible();
      const input = globalStateManager.getValue(fileName)

      if (result) {
        await inputValue(locator, input);
        return result;
      }
    });
});


When('I select {string} from the {string} dropdown',
  async function (this: ScenarioWorld, option: string, name: string) {
    const {
      screen: { page },
      globalConfig,
      globalStateManager
    } = this;

    await waitFor(async() => {
      const locator = await page.locator(`select${name}`);
      const result = await locator.isVisible();

      if (result) {
        await locator.selectOption(option);
        return result;
      }
    });
  }
)
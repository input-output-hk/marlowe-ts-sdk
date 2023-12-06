import { Then } from '@cucumber/cucumber';
import { ElementKey, ValidAccessibilityRoles } from '../../env/global.js';
import { ScenarioWorld } from '../setup/world.js'
import { waitFor } from '../../support/wait-for-behavior.js';
import { getElementLocator } from '../../support/web-element-helper.js';
import moment from 'moment';

Then(
  /^the "([^"]*)" should contain "([^"]*)" text$/,
  async function(this: ScenarioWorld, role: ValidAccessibilityRoles, name: string) {
    const {
      screen: { page }
    } = this;
    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const elementText = await locator.textContent();
      return elementText?.includes(name);
    })
  }
);

Then(
  /^the "([^"]*)" input should contain "([^"]*)" value$/,
  async function(this: ScenarioWorld, elementKey: ElementKey, expectedValue: string) {
    const {
      screen: { page },
      globalConfig
    } = this;

    const elementIdentifier = getElementLocator(page, elementKey, globalConfig);
    const { role, name } = elementIdentifier;

    await waitFor(async() => {
      const locator = await page.getByRole(role as ValidAccessibilityRoles, { name, exact: true });
      const actualValue = await locator.inputValue();
      return actualValue == expectedValue;
    })
  }
);



Then(
  /^the "([^"]*)" for "([^"]*)" should contain "([^"]*)" text$/,
  async function(this: ScenarioWorld, role: ValidAccessibilityRoles, name: string, expectedText: string) {
    const {
      screen: { page },
      globalConfig
    } = this;
    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const elementText = await locator.textContent();
      return elementText?.includes(expectedText);
    })
  }
);

Then(
  /^the "([^"]*)" with "([^"]*)" text should have "([^"]*)" class$/, 
  async function (this: ScenarioWorld, role: ValidAccessibilityRoles, name: string, expectedClass: string) {
    const {
      screen: { page },
    } = this;
    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        const classNames = await locator.getAttribute('class');
        if (classNames) {
          const classNamesArray = classNames.split(' ');
          return classNamesArray.includes(expectedClass);
        }
      }
    })
});

Then('the {string} with {string} text should contain {string} text',
  async function (this: ScenarioWorld, role: ValidAccessibilityRoles, name: string, expectedText: string) {
    const {
      screen: { page },
    } = this;
    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        const elementText = await locator.textContent();
        return elementText?.includes(expectedText);
      }
    })
});

Then(
  /^the "([^"]*)" time should be (greater\s+than|less\s+than|equal\s+to) the "([^"]*)" time$/, 
  async function (this: ScenarioWorld, firstTimeLabel: string, operator: string, secondTimeLabel: string) {
    const {
      screen: { page },
      globalConfig: { simulatorDateFormat },
      globalStateManager
    } = this;
    const firstTimeName = `${firstTimeLabel} time`;
    const secondTimeName = `${secondTimeLabel} time`;
    await waitFor(async() => {
      const firstTime = globalStateManager.getValue(firstTimeName);
      const secondTime = globalStateManager.getValue(secondTimeName);
      if(operator === "greater than") {
        return firstTime > secondTime;
      } else if(operator === "less than") {
        return firstTime < secondTime;
      } else if(operator === "equal to") {
        return firstTime.getTime() === secondTime.getTime();
      }
      return false;
    });
});

Then(
  /^I expect the "([^"]*)" time to (increase|decrease) by "([^"]*)" minutes$/, 
  async function (this: ScenarioWorld, timeLabel: string, operation: string, increment: string) {
    const {
      globalStateManager
    } = this;

    const timeName = `${timeLabel} time`;
    await waitFor(async() => {
      const timeValues = globalStateManager.get(timeName);
      const valuesLength = timeValues.length;
      const oldTime = timeValues[valuesLength - 2];
      const newTime = timeValues[valuesLength - 1];
      const diffMinutes = moment(newTime).diff(moment(oldTime), 'minutes');
      if (operation === "increase") {
        return diffMinutes === parseInt(increment);
      } else if (operation === "decrease") {
        return diffMinutes === -parseInt(increment);
      }
    });
});

Then(
  /^I expect the "([^"]*)" time to match it's previous value$/, 
  async function (this: ScenarioWorld, timeLabel: string) {
    const {
      globalStateManager
    } = this;

    const timeName = `${timeLabel} time`;
    await waitFor(async() => {
      const timeValues = globalStateManager.get(timeName);
      const valuesLength = timeValues.length;
      const oldTime = timeValues[valuesLength - 2];
      const newTime = timeValues[valuesLength - 1];
      return oldTime.getTime() === newTime.getTime();
    });
});


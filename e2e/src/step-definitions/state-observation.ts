import { When } from '@cucumber/cucumber';
import { ScenarioWorld } from './setup/world.js';
import { waitFor } from '../support/wait-for-behavior.js';
import moment from 'moment';

When(/^I observe the "([^"]*)" time$/,
async function (this: ScenarioWorld, timeLabel: string) {
    const {
      screen: { page },
      globalConfig: { simulatorDateFormat },
      globalStateManager 
    } = this;

    await waitFor(async() => {
      const name = `${timeLabel} time`;
      const locator = await page.getByRole("heading", { name, exact: true });
      const dateString = await locator.textContent();
      if (dateString) {
        const originalTime = moment(dateString, simulatorDateFormat).toDate();
        globalStateManager.appendValue(name, originalTime);
        return true;
      }

      return false;
    });
});

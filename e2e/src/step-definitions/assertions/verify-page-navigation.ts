import { Then } from '@cucumber/cucumber';
import { PageId } from '../../env/global.js';
import { ScenarioWorld } from '../setup/world.js'
import { waitFor } from '../../support/wait-for-behavior.js';
import {
  currentPathMatchesPageId,
} from '../../support/navigation-behavior.js';

Then(
  /^I should be on the "([^"]*)" page$/,
  async function(this: ScenarioWorld, pageId: PageId) {
    const {
      screen: { page },
      globalConfig,
    } = this;

  await waitFor(() => currentPathMatchesPageId(page, pageId, globalConfig))
});

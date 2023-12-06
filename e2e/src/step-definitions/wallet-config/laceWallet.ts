import playwright from 'playwright';
import { When } from '@cucumber/cucumber';
import { ScenarioWorld } from '../setup/world.js';
import { waitFor } from "../../support/wait-for-behavior.js";
import { testWallet } from "../../support/walletConfiguration.js";
import { ValidAccessibilityRoles } from '../../env/global.js';
import * as fs from 'fs';
import {
  inputValue,
} from '../../support/html-behavior.js';

function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

When(
  /^I click the "([^"]*)" with "([^"]*)" text And authorize my lace wallet$/,
  async function(this: ScenarioWorld, role: ValidAccessibilityRoles,  name: string) {
    const {
      screen: { page },
      globalStateManager
    } = this;

    let newPagePromise;

    newPagePromise = new Promise(resolve => page.context().once('page', resolve));

    await waitFor(async() => {
      const locator = await page.getByRole("button", { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    const newPage = await newPagePromise as playwright.Page;

    await waitFor(async() => {
      await newPage.reload();
      return true;
    });

    sleep(30)

    await waitFor(async() => {
      const buttonName = "Authorize"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Always"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    // await waitFor(async() => {
    //   const locator = await page.getByTestId("wallet-info");
    //   const result = await locator.isVisible();
    //   if (result) {
    //     const address = await locator.getAttribute("data-wallet-address");
    //     globalStateManager.appendValue("wallet-address", address);
    //     return result;
    //   }
    // });
  }
);

When(
  /^I configure my lace wallet$/,
  async function(this: ScenarioWorld) {
    const {
      screen: { page },
      globalStateManager
    } = this;


    const EXTENSION_URL = 'chrome-extension://gafhhkghbfjjkeiendhlofajokpaflmk';

    const mnemonic = fs.readFileSync('artifacts/mnemonic.txt', 'utf-8');
    const words = mnemonic.trim().split(' ');
    const newPage = await page.context().newPage();
    await newPage.goto(`${EXTENSION_URL}/app.html`);

    await waitFor(async() => {
      const buttonName = "Restore"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "OK"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "I accept the Terms of Use"
      const locator = await newPage.getByRole("checkbox", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Agree"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId("wallet-setup-register-name-input")
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, "Runner test");
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId("wallet-setup-password-step-password")
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, "RunnerE2ETest");
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId("wallet-setup-password-step-confirm-password")
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, "RunnerE2ETest");
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    for (let i = 0; i < 8; i++) {
      await waitFor(async() => {
        const locator = await newPage.locator(`#mnemonic-word-${i+1}`)
        const result = await locator.isVisible();

        if (result) {
          await inputValue(locator, words[i]);
          return result;
        }
      });
    }

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    for (let i = 8; i < 16; i++) {
      await waitFor(async() => {
        const locator = await newPage.locator(`#mnemonic-word-${i+1}`)
        const result = await locator.isVisible();

        if (result) {
          await inputValue(locator, words[i]);
          return result;
        }
      });
    }

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    for (let i = 16; i < 24; i++) {
      await waitFor(async() => {
        const locator = await newPage.locator(`#mnemonic-word-${i+1}`)
        const result = await locator.isVisible();

        if (result) {
          await inputValue(locator, words[i]);
          return result;
        }
      });
    }

    await waitFor(async() => {
      const buttonName = "Next"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Go to my wallet"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Got it"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId("user-avatar")
      const result = await locator.isVisible();

      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId('header-menu').getByTestId('header-menu-network-choice-label')
      const result = await locator.isVisible();

      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId('header-menu').getByTestId("network-preprod-radio-button")
      const result = await locator.isVisible();

      if (result) {
        await locator.click();
        return result;
      }
    });

    await newPage.waitForTimeout(200);
    await newPage.close();
    await page.reload();

});


When(
  /^I click the "([^"]*)" with "([^"]*)" text And sign the transaction with lace wallet$/,
  async function(this: ScenarioWorld, role: ValidAccessibilityRoles,  name: string) {
    const {
      screen: { page },
      globalStateManager
    } = this;

    let newPagePromise;

    newPagePromise = new Promise(resolve => page.context().once('page', resolve));

    await waitFor(async() => {
      const locator = await page.getByRole(role, { name, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    // Await for new page to popup
    const newPage = await newPagePromise as playwright.Page;

    await waitFor(async() => {
      await newPage.reload();
      return true;
    });

    await waitFor(async() => {
      const buttonName = "Confirm"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByTestId("password-input")
      const result = await locator.isVisible();

      if (result) {
        const password = process.env.LACE_WALLET_PASSWORD as string
        await inputValue(locator, password);
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Confirm"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Close"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });
  }
);
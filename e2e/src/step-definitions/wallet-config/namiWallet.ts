import playwright from 'playwright';
import { When } from '@cucumber/cucumber';
import { ScenarioWorld } from '../setup/world.js';
import { waitFor } from "../../support/wait-for-behavior.js";
import { testWallet } from "../../support/walletConfiguration.js";
import { inputValue } from '../../support/html-behavior.js';
import * as fs from 'fs';
import { ValidAccessibilityRoles } from '../../env/global.js';

function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

When(
  /^I authorize my nami wallet$/,
  async function(this: ScenarioWorld) {
    const {
      screen: { page },
      globalStateManager
    } = this;

    let newPagePromise;

    newPagePromise = new Promise(resolve => page.context().once('page', resolve));

    const name = "Nami";
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

    await waitFor(async() => {
      const locator = await newPage.getByText("Access")
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await page.getByTestId("wallet-info");
      const result = await locator.isVisible();
      if (result) {
        const address = await locator.getAttribute("data-wallet-address");
        globalStateManager.appendValue("wallet-address", address);
        return result;
      }
    });

  }
);

When(
  /^I configure my nami wallet$/,
  async function(this: ScenarioWorld) {
    const {
      screen: { page },
    } = this;

    const mnemonic = fs.readFileSync('artifacts/mnemonic.txt', 'utf-8');
    const words = mnemonic.trim().split(' ');

    const EXTENSION_URL = 'chrome-extension://nkdhfgepnkiilghfdmpfnlnhckniegoc';

    const newPage = await page.context().newPage();
    await newPage.goto(`${EXTENSION_URL}/createWalletTab.html?type=import&length=24`);


    // const inputField = async (name, value) => {
    //   const locator = await newPage.getByRole("textbox", { name: name, exact: true });
    //   const result = await locator.isVisible();
    //   if (result) {
    //     await inputValue(locator, value);
    //     return result;
    //   }
    // }

    for (let i = 0; i < 24; i++) {
      const name = `Word ${i+1}`;
      await waitFor(async() => {
      const locator = await newPage.getByRole("textbox", { name: name, exact: true });
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
      const name = "Enter account name";
      const locator = await newPage.getByRole("textbox", { name: name, exact: true });
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, "Runner test");
        return result;
      }
    });

    await waitFor(async() => {
      const name = "Enter password";
      const locator = await newPage.getByRole("textbox", { name: name, exact: true });
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, "Runner test");
        return result;
      }
    });

    await waitFor(async() => {
      const name = "Confirm password";
      const locator = await newPage.getByRole("textbox", { name: name, exact: true });
      const result = await locator.isVisible();

      if (result) {
        await inputValue(locator, "Runner test");
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Create"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await newPage.waitForTimeout(200);

    await waitFor(async() => {
      const buttonName = "Close"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    const mainPage = await page.context().newPage();
    await mainPage.goto(`${EXTENSION_URL}/mainPopup.html`);

    await waitFor(async() => {
      const buttonName = ""
      const locator = await mainPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Settings"
      const locator = await mainPage.getByRole("menuitem", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const buttonName = "Network"
      const locator = await mainPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const network = "Preprod"
      const locator = await mainPage.getByRole("combobox");
      const result = await locator.isVisible();
      if (result) {
        await locator.selectOption(network);
        return result;
      }
    });

    await mainPage.close();
    await page.reload();
});

When(
  /^I click the "([^"]*)" with "([^"]*)" text And sign the transaction with nami wallet$/,
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
      const buttonName = "Sign"
      const locator = await newPage.getByRole("button", { name: buttonName, exact: true });
      const result = await locator.isVisible();
      if (result) {
        await locator.click();
        return result;
      }
    });

    await waitFor(async() => {
      const locator = await newPage.getByRole("textbox", { name: "Enter password", exact: true });
      const result = await locator.isVisible();

      if (result) {
        const password = process.env.NAMI_WALLET_PASSWORD as string
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
  }
);
import { When } from '@cucumber/cucumber';
import { ScenarioWorld } from './setup/world.js';
import {
  Contract,
  datetoTimeout,
} from "@marlowe.io/language-core-v1";
import { MarloweJSON } from "@marlowe.io/adapter/codec";

type ContractName = "SimpleDeposit" | "SimpleChoice" | "TimedOutSimpleChoice" | "SimpleNotify";

const mkSimpleDeposit = (address: string): Contract => {
  const twentyMinutesInMilliseconds = 20 * 60 * 1000;
  const inTwentyMinutes = datetoTimeout(new Date(Date.now() + twentyMinutesInMilliseconds));
  return {
    timeout: inTwentyMinutes,
    timeout_continuation: "close",
    when: [
      { case: {
          party: {address: address},
          deposits: 1n,
          of_token: { currency_symbol: "", token_name: "" },
          into_account: {address: address}
        },
        then: "close",
      },
    ]
  };
}

const mkSimpleChoice = (address: string): Contract => {
  const twentyMinutesInMilliseconds = 20 * 60 * 1000;
  const inTwentyMinutes = datetoTimeout(new Date(Date.now() + twentyMinutesInMilliseconds));
  return {
    timeout: inTwentyMinutes,
    timeout_continuation: "close",
    when: [
      { case: {
          choose_between:
            [{
              from: 1n,
              to: 2n
            }],
          for_choice: {
            choice_owner: {address: address},
            choice_name: "simpleChoice",
          }
        },
        then: "close",
      },
    ]
  };
}

const mkTimedOutSimpleChoice = (address: string): Contract => {
  const twentyMinutesInMilliseconds = 20 * 60 * 1000;
  const inTwentyMinutes = datetoTimeout(new Date(Date.now() - twentyMinutesInMilliseconds));
  return {
    timeout: inTwentyMinutes,
    timeout_continuation: "close",
    when: [
      { case: {
          choose_between:
            [{
              from: 1n,
              to: 2n
            }],
          for_choice: {
            choice_owner: {address: address},
            choice_name: "simpleChoice",
          }
        },
        then: "close",
      },
    ]
  };
}
const mkSimpleNotify = (address: string): Contract => {
  const twentyMinutesInMilliseconds = 20 * 60 * 1000;
  const inTwentyMinutes = datetoTimeout(new Date(Date.now() - twentyMinutesInMilliseconds));
  return {
    timeout: inTwentyMinutes,
    timeout_continuation: "close",
    when: [
      { case: {
          notify_if: true,
        },
        then: "close",
      },
    ]
  };
}


// // And I generate the contract "SimpleDeposit" and write it to "/tmp/deposit.json"
When(
  /^I generate the contract "([^"]*)" and write it to "([^"]*)"/,
  async function(this: ScenarioWorld, contractName: ContractName, fileName: string) {
    const {
      globalStateManager
    } = this;
    const walletAddress = globalStateManager.getValue("wallet-address");
    switch (contractName) {
      case "SimpleDeposit":
        const contract1 = mkSimpleDeposit(walletAddress);
        globalStateManager.appendValue(fileName, MarloweJSON.stringify(contract1, null, 4))
        break;
      case "SimpleChoice":
        const contract2 = mkSimpleChoice(walletAddress);
        globalStateManager.appendValue(fileName, MarloweJSON.stringify(contract2, null, 4))
        break;
      case "TimedOutSimpleChoice":
        const contract3 = mkTimedOutSimpleChoice(walletAddress);
        globalStateManager.appendValue(fileName, MarloweJSON.stringify(contract3, null, 4))
        break;
      case "SimpleNotify":
        const contract4 = mkSimpleNotify(walletAddress);
        globalStateManager.appendValue(fileName, MarloweJSON.stringify(contract4, null, 4))
        break;
    }
  }
);
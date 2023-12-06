@smoke
@regression

Feature: As a user, I would like test the 'wallet flow' example POC

    As a user I would like to test the 'wallet flow' example POC

    Scenario Outline: Test wallet flow with <wallet_name> wallet
      Given I configure my <wallet_name> wallet
      And I am on the "wallet-flow" page
      Then I should see a "combobox" with "Select wallet:" text

      When I select "<wallet_option>" from the "#wallet" dropdown
      And I click the "button" with "Start flow" text And authorize my <wallet_name> wallet
      Then I should see "Reading Wallet information..." text
      And I should see "* Network: Testnet" text
      And I should see "NOTE: The CIP30 standard can't distinguish between testnet networks (preprod/preview/etc)" text
      And I should see "- Lovelaces:" text
      And I should see "- Tokens:" text
      And I should see "lovelaces -" text
      And I should see "- Change Address:" text

    Examples:
      | wallet_name | wallet_option |
      | lace        | Lace          |

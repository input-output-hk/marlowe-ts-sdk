@smoke
@regression
@dev

Feature: As a user, I would like test the 'get my contract id flow' example POC

    As a user I would like to test the 'get my contract id flow' example POC

    Scenario: Test healthcheck endpoint on rest client flow
      And I am on the "rest-client-flow" page
      Then I should see a "button" with "Healthcheck" text

      When I wait for 5 seconds
      When I click the "button" with "Healthcheck" text
      Then I should see "Calling healthcheck on https://marlowe-runtime-preprod-web.demo.scdev.aws.iohkdev.io/" text
      Then I should see "Result:" text
      Then I should see "true" text

      When I click the "button" with "Clear console" text
      And I click the "button" with "Get Contracts" text
      Then I should see "Getting contracts from https://marlowe-runtime-preprod-web.demo.scdev.aws.iohkdev.io/" text
      And I should see "Number of contracts in this range:" text
      And I should see "next range:" text
      And I should see "prev range:" text

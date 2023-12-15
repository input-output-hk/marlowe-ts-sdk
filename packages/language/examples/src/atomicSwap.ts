/**
 * <h4>Description</h4>
 * <p>
 * This module offers capabalities for running an Atomic Swap Contract. Atomic swaps,
 * offer a way to swap cryptocurrencies peer-to-peer from different blockchains directly
 * without the requirement for a third party, such as an exchange.</p>
 * <p>
 * This Marlowe Contract has 2 participants (A `Seller` and a `Buyer`) that will atomically exchange
 * some tokens A against some token B. Sellers can retract their offer and every state of this contract
 * are timeboxed. The Seller is known at the contract creation but this contract is specifically designed
 * to allow Buyers to be unknowm at the creation of the contract over Cardano (Open Role Feature).
 * Consequently, an extra Notify input is added after the swap to avoid double-satisfaction attack (see below)
 * </p>
 * <h4>Security restriction for open roles</h4>
 * <p>
 * Marlowe's prevention of double-satisfaction attacks requires that no external payments be made from a Marlowe contract
 * if another Plutus script runs in the transaction. Thus, if an open-role is distributed in a transaction, the transaction
 * cannot do Pay to parties or implicit payments upon Close. Typically, the distribution of an open-role in a Marlowe contract
 * will be followed by a Notify TrueObs case so that further execution of the contract does not proceed in that transactions.
 * External payments can be made in subsequent transactions.
 * </p>
 * @see
 *  - https://github.com/input-output-hk/marlowe-cardano/blob/main/marlowe-runtime/doc/open-roles.md
 *
 * @example
 *
 * ```ts
 * import { AtomicSwap } from "@marlowe.io/language-examples";
 * import { datetoTimeout, tokenValue } from "@marlowe.io/language-core-v1";
 * import { addDays } from "date-fns";
 *
 * const aSellerAddressBech32 = "addr_test1qqe342swyfn75mp2anj45f8ythjyxg6m7pu0pznptl6f2d84kwuzrh8c83gzhrq5zcw7ytmqc863z5rhhwst3w4x87eq0td9ja"
 *
 * const tokenA = token("1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f","A")
 * const tokenB = token("1f7a58a1aa1e6b047a42109ade331ce26c9c2cce027d043ff264fb1f","B")
 *
 * const scheme: AtomicSwap.Scheme = {
 *      participants: {
 *        seller: { address: aSellerAddressBech32 },
 *        buyer: { role_token: "buyer" },
 *      },
 *      offer: {
 *        deadline: datetoTimeout(addDays(Date.now(), 1)),
 *        asset: tokenValue(10n)(tokenA),
 *      },
 *      ask: {
 *        deadline: datetoTimeout(addDays(Date.now(), 1)),
 *        asset: tokenValue(10n)(tokenB),
 *      },
 *      swapConfirmation: {
 *        deadline: datetoTimeout(addDays(Date.now(), 1)),
 *      },
 *    };
 *
 * const myAtomicSwap = AtomicSwap.mkContract(scheme)
 *
 * // .. Then you can use the runtime to pilot this contract over Cardano using `getState` ...
 * ```
 *
 * @packageDocumentation
 */

import {
  Contract,
  close,
  TokenValue,
  Timeout,
  Party,
  PayeeParty,
  Input,
  MarloweState,
  IChoice,
  IDeposit,
  INotify,
  Address,
  datetoTimeout,
  Role,
} from "@marlowe.io/language-core-v1";
import * as G from "@marlowe.io/language-core-v1/guards";

type IReduce = void;
const iReduce: void = undefined;

/* #region Scheme */

export type Scheme = {
  participants: {
    seller: Address;
    buyer: Role;
  };
  offer: {
    deadline: Timeout;
    asset: TokenValue;
  };
  ask: {
    deadline: Timeout;
    asset: TokenValue;
  };
  swapConfirmation: {
    deadline: Timeout;
  };
};

/* #endregion */

/* #region State */
export type State =
  | WaitingSellerOffer
  | NoSellerOfferInTime
  | WaitingForAnswer
  | WaitingForSwapConfirmation
  | Closed;

export type WaitingSellerOffer = {
  typeName: "WaitingSellerOffer";
  scheme: Scheme;
  action: ProvisionOffer;
};

export type NoSellerOfferInTime = {
  typeName: "NoSellerOfferInTime";
  scheme: Scheme;
  action: RetrieveMinimumLovelaceAdded;
};

export type WaitingForAnswer = {
  typeName: "WaitingForAnswer";
  scheme: Scheme;
  actions: [Swap, Retract];
};

export type WaitingForSwapConfirmation = {
  typeName: "WaitingForSwapConfirmation";
  scheme: Scheme;
  action: ConfirmSwap;
};

export type Closed = {
  typeName: "Closed";
  scheme: Scheme;
  reason: CloseReason;
};

/* #region Action  */
export type Action =
  /* When Contract Created (timed out > NoOfferProvisionnedOnTime) */
  | ProvisionOffer // > OfferProvisionned
  /* When NoOfferProvisionnedOnTime (timed out > no timeout (need to be reduced to be closed))*/
  | RetrieveMinimumLovelaceAdded // > closed
  /* When OfferProvisionned (timed out > NotNotifiedOnTime) */
  | Retract // > closed
  | Swap // > Swapped
  /* When Swapped  (timed out > NotNotifiedOnTime) */
  | ConfirmSwap; // > closed

export type ActionParticipant = "buyer" | "seller" | "anybody";

export type RetrieveMinimumLovelaceAdded = {
  typeName: "RetrieveMinimumLovelaceAdded";
  owner: ActionParticipant;
  input: IReduce;
};

export type ProvisionOffer = {
  typeName: "ProvisionOffer";
  owner: ActionParticipant;
  input: IDeposit;
};

export type Swap = {
  typeName: "Swap";
  owner: ActionParticipant;
  input: IDeposit;
};

export type ConfirmSwap = {
  typeName: "ConfirmSwap";
  owner: ActionParticipant;
  input: INotify;
};

export type Retract = {
  typeName: "Retract";
  owner: ActionParticipant;
  input: IChoice;
};

/* #endregion */

/* #region Close Reason */
export type CloseReason =
  | NoOfferProvisionnedOnTime
  | SellerRetracted
  | NotAnsweredOnTime
  | Swapped
  | NotNotifiedOnTime;

export type NoOfferProvisionnedOnTime = {
  typeName: "NoOfferProvisionnedOnTime";
};
export type SellerRetracted = { typeName: "SellerRetracted" };
export type NotAnsweredOnTime = { typeName: "NotAnsweredOnTime" };
export type NotNotifiedOnTime = { typeName: "NotNotifiedOnTime" };
export type Swapped = { typeName: "Swapped" };

/* #endregion */

export class UnexpectedSwapContractState extends Error {
  public type = "UnexpectedSwapContractState" as const;
  public scheme: Scheme;
  public state?: MarloweState;
  constructor(scheme: Scheme, state?: MarloweState) {
    super("Swap Contract / Unexpected State");
    this.scheme = scheme;
    this.state = state;
  }
}

/* #endregion */
export const getState = (
  scheme: Scheme,
  inputHistory: Input[],
  state?: MarloweState
): State => {
  /* #region Closed State */
  if (state === null) {
    // The Contract is closed when the State is null
    if (inputHistory.length === 0) {
      // Offer Provision Deadline has passed and there is one reduced applied to close the contract
      return {
        typeName: "Closed",
        scheme: scheme,
        reason: { typeName: "NoOfferProvisionnedOnTime" },
      };
    }
    if (inputHistory.length === 1) {
      return {
        typeName: "Closed",
        scheme: scheme,
        reason: { typeName: "NotAnsweredOnTime" },
      };
    }
    if (inputHistory.length === 2) {
      const isRetracted =
        1 ===
        inputHistory
          .filter((input) => G.IChoice.is(input))
          .map((input) => input as IChoice)
          .filter((choice) => choice.for_choice_id.choice_name === "retract")
          .length;
      const nbDeposits = inputHistory.filter((input) =>
        G.IDeposit.is(input)
      ).length;
      if (isRetracted && nbDeposits === 1) {
        return {
          typeName: "Closed",
          scheme: scheme,
          reason: { typeName: "SellerRetracted" },
        };
      }
      if (nbDeposits === 2) {
        return {
          typeName: "Closed",
          scheme: scheme,
          reason: { typeName: "NotNotifiedOnTime" },
        };
      }
    }
    if (inputHistory.length === 3) {
      const nbDeposits = inputHistory.filter((input) =>
        G.IDeposit.is(input)
      ).length;
      const nbNotify = inputHistory.filter((input) =>
        G.INotify.is(input)
      ).length;
      if (nbDeposits === 2 && nbNotify === 1) {
        return {
          typeName: "Closed",
          scheme: scheme,
          reason: { typeName: "Swapped" },
        };
      }
    }
  }
  /* #endregion */

  const now: Timeout = datetoTimeout(new Date());

  if (inputHistory.length === 0) {
    if (now < scheme.offer.deadline) {
      const offerInput: IDeposit = {
        input_from_party: scheme.participants.seller,
        that_deposits: scheme.offer.asset.amount,
        of_token: scheme.offer.asset.token,
        into_account: scheme.participants.seller,
      };
      return {
        typeName: "WaitingSellerOffer",
        scheme,
        action: {
          typeName: "ProvisionOffer",
          owner: "seller",
          input: offerInput,
        },
      };
    } else {
      return {
        typeName: "NoSellerOfferInTime",
        scheme,
        action: {
          typeName: "RetrieveMinimumLovelaceAdded",
          owner: "anybody",
          input: iReduce,
        },
      };
    }
  }

  if (inputHistory.length === 1) {
    if (now < scheme.ask.deadline) {
      const askInput: IDeposit = {
        input_from_party: scheme.participants.buyer,
        that_deposits: scheme.ask.asset.amount,
        of_token: scheme.ask.asset.token,
        into_account: scheme.participants.buyer,
      };
      const retractInput: IChoice = {
        for_choice_id: {
          choice_name: "retract",
          choice_owner: scheme.participants.seller,
        },
        input_that_chooses_num: 0n,
      };
      return {
        typeName: "WaitingForAnswer",
        scheme: scheme,
        actions: [
          {
            typeName: "Swap",
            owner: "buyer",
            input: askInput,
          },
          {
            typeName: "Retract",
            owner: "seller",
            input: retractInput,
          },
        ],
      };
    } else {
      // Closed (handled upstream)
    }
  }

  if (inputHistory.length === 2) {
    const nbDeposits = inputHistory.filter((input) =>
      G.IDeposit.is(input)
    ).length;
    if (nbDeposits === 2 && now < scheme.swapConfirmation.deadline) {
      return {
        typeName: "WaitingForSwapConfirmation",
        scheme: scheme,
        action: {
          typeName: "ConfirmSwap",
          owner: "anybody",
          input: "input_notify",
        },
      };
    } else {
      // Closed (handled upstream)
    }
  }

  throw new UnexpectedSwapContractState(scheme, state);
};
export function mkContract(scheme: Scheme): Contract {
  const mkOffer = (ask: Contract): Contract => {
    const depositOffer = {
      party: scheme.participants.seller,
      deposits: scheme.offer.asset.amount,
      of_token: scheme.offer.asset.token,
      into_account: scheme.participants.seller,
    };

    return {
      when: [{ case: depositOffer, then: ask }],
      timeout: scheme.offer.deadline,
      timeout_continuation: close,
    };
  };

  const mkAsk = (confirmSwap: Contract): Contract => {
    const asPayee = (party: Party): PayeeParty => ({ party: party });
    const depositAsk = {
      party: scheme.participants.buyer,
      deposits: scheme.ask.asset.amount,
      of_token: scheme.ask.asset.token,
      into_account: scheme.participants.buyer,
    };
    const chooseToRetract = {
      choose_between: [{ from: 0n, to: 0n }],
      for_choice: {
        choice_name: "retract",
        choice_owner: scheme.participants.seller,
      },
    };
    return {
      when: [
        {
          case: depositAsk,
          then: {
            pay: scheme.offer.asset.amount,
            token: scheme.offer.asset.token,
            from_account: scheme.participants.seller,
            to: asPayee(scheme.participants.buyer),
            then: {
              pay: scheme.ask.asset.amount,
              token: scheme.ask.asset.token,
              from_account: scheme.participants.buyer,
              to: asPayee(scheme.participants.seller),
              then: confirmSwap,
            },
          },
        },
        {
          case: chooseToRetract,
          then: close,
        },
      ],
      timeout: scheme.ask.deadline,
      timeout_continuation: close,
    };
  };

  const mkSwapConfirmation = (): Contract => {
    return {
      when: [{ case: { notify_if: true }, then: close }],
      timeout: scheme.swapConfirmation.deadline,
      timeout_continuation: close,
    };
  };

  return mkOffer(mkAsk(mkSwapConfirmation()));
}

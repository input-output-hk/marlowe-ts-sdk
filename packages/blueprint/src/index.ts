interface ContractParameter {
  name: string;
  description?: string;
}

interface AddressParameter extends ContractParameter {
  type: "address";
}

interface DateParameter extends ContractParameter {
  type: "date";
}

interface ValueParameter extends ContractParameter {
  type: "value";
}

type BlueprintParameter = AddressParameter | DateParameter | ValueParameter;

type Blueprint = BlueprintParameter[];

const delayPaymentBlueprint: Blueprint = [
  {
    name: "payFrom",
    description: "Who is making the delayed payment",
    type: "address",
  },
  {
    name: "payTo",
    description: "Who is receiving the payment",
    type: "address",
  },
  {
    name: "amount",
    description: "The amount of lovelaces to be paid",
    type: "value",
  },
  {
    name: "depositDeadline",
    description:
      "The deadline for the payment to be made. If the payment is not made by this date, the contract can be closed",
    type: "date",
  },
  {
    name: "releaseDeadline",
    description:
      "A date after the payment can be released to the receiver. NOTE: An empty transaction must be done to close the contract",
    type: "date",
  },
];

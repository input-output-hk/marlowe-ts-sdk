import { log, logJSON } from "../../js/poc-helpers.js";
import * as H from "../../js/poc-helpers.js";
import { mkWorkshopSurvey, verifySurveyContract } from "./contract.js";
import { MarloweJSON } from "@marlowe.io/adapter/codec";
import { encryptMessage } from "../custodian/custodian-encript.js";
import { timeoutToDate } from "@marlowe.io/language-core-v1";

// Common helpers for simple examples
H.setupClearConsole();
H.setupLocalStorageRuntimeUrl();
H.setupWallet();
window.contractId = null;

// Event handlers
const createContractButton = document.getElementById("create-contract");
createContractButton.addEventListener(
  "click",
  H.tryCatchEvent(createContractFromTemplate)
);

const submitButton = document.getElementById("submit");
submitButton.addEventListener("click", H.tryCatchEvent(submitAllAnswers));

const uploadExcerciseButton = document.getElementById("upload-excercise");
uploadExcerciseButton.addEventListener(
  "click",
  H.tryCatchEvent(createContractFromFileUpload)
);

/**
 * Helper function to get the survey participant address from the CIP30 wallet.
 * @returns @Party A fixed Address party
 */
async function getSurveyParticipant() {
  const wallet = await H.getWallet();
  const surveyParticipant = await wallet.getChangeAddress();
  return { address: surveyParticipant };
}

async function createContractFromFileUpload() {
  if (window.contractId != null) {
    log("Contract already created");
    return;
  }
  const surveyParticipant = await getSurveyParticipant();
  const contractFile = document.getElementById("contractFile");
  if (!contractFile.files[0]) {
    log("Please select a file first");
    return;
  }

  const file = contractFile.files[0];
  log(`Reading file ${file.name}`);
  const reader = new FileReader();
  function handleFile(event) {
    const contract = MarloweJSON.parse(event.target.result);
    const verification = verifySurveyContract(contract, surveyParticipant);
    if (!verification.match) {
      log("⛔️ Contract verification failed");
      const yieldSection = document.getElementById("yield-section");
      yieldSection.style.display = "block";
    } else {
      logJSON("✅ Contract verification succeeded", verification);
      const answerTimeout = timeoutToDate(verification.answerTimeout);
      const rewardTimeout = timeoutToDate(verification.rewardTimeout);
      createContract(answerTimeout, rewardTimeout);
    }
  }
  reader.addEventListener("load", H.tryCatchEvent(handleFile));
  reader.readAsText(file);
}

async function createContractFromTemplate() {
  if (window.contractId != null) {
    log("Contract already created");
    return;
  }
  const { answerTimeout, rewardTimeout } = getTimeouts();
  createContract(answerTimeout, rewardTimeout);
}

async function createContract(answerTimeout, rewardTimeout) {
  const surveyParticipant = await getSurveyParticipant();
  const contract = mkWorkshopSurvey({
    surveyParticipant,
    answerTimeout,
    rewardTimeout,
  });
  log("Creating contract");
  const lifecycle = await H.getLifecycle();
  const [contractId] = await lifecycle.contracts.createContract({
    contract,
    tags: { MarloweSurvey: "test 1" },
  });
  log(`Contract created. ContractId: ${contractId}`);

  window.contractId = contractId;
  H.setContractIdIndicator(window.contractId, "contract-id-indicator");
  const submitAnswerSection = document.getElementById("submit-answers-section");
  submitAnswerSection.style.display = "block";
}

async function submitAllAnswers() {
  if (window.contractId == null) {
    log("Please create a contract first");
    return;
  }
  log("Submitting survey answers");
  const answers = getAnswers();
  logJSON("Answers", getAnswers());
  const surveyParticipant = await getSurveyParticipant();

  const inputs = answersToChoices(answers, surveyParticipant);

  const commentsInput = document.getElementById("comments");
  const encryptResult = await encryptMessage(commentsInput.value);

  logJSON("Encrypt Result", encryptResult);

  inputs.push({
    for_choice_id: {
      choice_name: "answer5",
      choice_owner: surveyParticipant,
    },
    input_that_chooses_num: encryptResult.lastDigitsDecimal,
  });
  logJSON("inputs", inputs);
  const lifecycle = await H.getLifecycle();
  const txId = await lifecycle.contracts.applyInputs(window.contractId, {
    inputs,
    tags: encryptResult.chunks,
  });
  logJSON("Inputs applied", txId);
}

function answersToChoices(answers, surveyParticipant) {
  return answers.map((answer, i) => ({
    for_choice_id: {
      choice_name: `answer${i + 1}`,
      choice_owner: surveyParticipant,
    },
    input_that_chooses_num: answer,
  }));
}
function getAnswers() {
  const answerSelects = document.querySelectorAll("[id^='answer-']");
  const answers = [];
  answerSelects.forEach((select) => {
    answers.push(BigInt(select.value));
  });
  return answers;
}

function getTimeouts() {
  const answerTimeoutInput = document.getElementById("answerTimeout");
  const rewardTimeoutInput = document.getElementById("rewardTimeout");
  if (!answerTimeoutInput.value) {
    throw new Error("Need to set answer timeout");
  }
  if (!rewardTimeoutInput.value) {
    throw new Error("Need to set reward timeout");
  }
  return {
    answerTimeout: new Date(answerTimeoutInput.value),
    rewardTimeout: new Date(rewardTimeoutInput.value),
  };
}

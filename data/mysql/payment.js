import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { v4 as uuidV4 } from "uuid";

/**
 *
 * @param {object} regObj
 * @param {string} regObj.accountID
 * @param {string} regObj.itemID
 * @param {string} regObj.referenceID
 * @param {number} regObj.amount
 * @param {"initialized"|"pending"|"verifying"|"success"|"failed"|"cancelled"} regObj.state
 */
let saveInitializedPayment = async ({
  accountID,
  referenceID,
  itemID,
  amount,
  state,
}) => {
  let paymentID = uuidV4();
  try {
    let creationRes = await knex("payments").insert({
      paymentID,
      accountID,
      amount,
      itemID,
      referenceID,
      state: { name: state, setOn: new Date() },
    });
    console.log({creationRes})
    return paymentID;
  } catch (error) {
    console.log(error);
    throw { msg: error };
  }
};

/**
 *
 * @param {object} regObj
 * @param {string} regObj.referenceID
 * @param {string} regObj.paymentID
 * @param {"initialized"|"pending"|"verifying"|"success"|"failed"|"cancelled"} regObj.state
 */
let updateState = async ({ paymentID,referenceID, state }) => {
  try {
    let trx = await knex.transactionProvider()();
    let [paymentInfo] = await trx("payments").select("*").where({ paymentID }).orWhere({referenceID});
    if (!paymentInfo) {
      throw { msg: "No such paymentID" };
    }
    let { state: oldState, stateHistory } = paymentInfo;
    if (!stateHistory) {
      stateHistory = [];
    }
    let transitionables = ["initialized", "pending", "verifying"];
    if (!transitionables.some((val) => val === oldState.name)) {
      return { info: "State not transitionable" };
    }
    stateHistory.push(oldState);
    state = { name: state, setOn: new Date() };
    let updateRes = await trx("accounts")
      .update({
        state: JSON.stringify(state),
        stateHistory: JSON.stringify(stateHistory),
      })
      .where({ paymentID }).orWhere({referenceID});
    return updateRes;
  } catch (error) {
    console.log(error);
    throw { msg: error };
  }
};

export {
  saveInitializedPayment as saveInitializedPaymentMySQL,
  updateState as updateStateMySQL,
};

import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { v4 as uuidV4 } from "uuid";

/**
 *
 * @param {string} identifier
 */
let getAccount = async (identifier) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("accounts")
      .where({ email: identifier })
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        let account = response[0];
        if (!account) {
          rej({msg:"No account matches email."})
        }
        account = { ...account, isEmailVerified: !!account.isEmailVerified };
        resolve(account);
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        console.log({err})
        rej(err) ;
      });
  });
  return prom;
};

/**
 *
 * @param {string} identifier
 */
let verifyEmail = async (email) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("login_sessions")
      .where({ email })
      .update({ isEmailVerified: true })
      .where({ email })
      .on("query-error", function (error, obj) {
        if (
          error.code === "ER_DUP_ENTRY" ||
          new String(error.message).toLocaleLowerCase().includes("duplicate")
        ) {
          return rej({ msg: "Email already taken." });
        }
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        console.log(response);
        let account = response[0];
        account = { ...account, isEmailVerified: !!account.isEmailVerified };
        resolve(account);
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
      });
  });
  return prom;
};

/**
 *
 * @param {string} accountID
 */
let getAccountByAccountID = async (accountID) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("accounts")
      .where({ accountID })
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        let account = response[0];
        account = { ...account, isEmailVerified: !!account.isEmailVerified };
        resolve(account);
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
      });
  });
  return prom;
};

/**
 *
 * @param {object} regObj
 * @param {string} regObj.email
 * @param {boolean} regObj.isEmailVerified
 * @param {string} regObj.pass_hash
 * @param {"student"|"staff"} regObj.account_type
 */
let createAccount = async ({
  email,
  pass_hash,
  account_type = "client",
  isEmailVerified = false,
}) => {
  let accountID = uuidV4();
  let prom = new Promise(async (resolve, rej) => {
    knex("accounts")
      .insert({
        email,
        pass_hash,
        isEmailVerified,
        account_type,
        accountID,
        state: { name: "active", changedOn: new Date() },
      })
      .on("query-error", function (error, obj) {
        if (
          error.code === "ER_DUP_ENTRY" ||
          new String(error.message).toLocaleLowerCase().includes("duplicate")
        ) {
          return rej({ msg: "Email already taken." });
        }
        console.log(error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        resolve({ accountID });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
      });
  });
  return prom;
};

/**
 *
 * @param {object} regObj
 * @param {string} regObj.email
 * @param {string} regObj.pass_hash
 */
let changePassword = async ({
  email,
  pass_hash,
}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("accounts")
      .update({
        pass_hash,
      }).where({email})
      .on("query-error", function (error, obj) {
        console.log(error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        resolve({ info:"Password changed" });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
      });
  });
  return prom;
};

export {
  createAccount as createAccountMysql,
  getAccount as getAccountMysql,
  getAccountByAccountID as getAccountByAccountIDMySQL,
  verifyEmail as verifyEmailMySQL,
  changePassword as changePasswordMySQL
};

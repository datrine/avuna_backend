import { json } from "express";
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
          rej({ msg: "No account matches email." });
        }
        account = { ...account, isEmailVerified: !!account.isEmailVerified };
        resolve(account);
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        console.log({ err });
        rej(err);
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
    knex("accounts")
      .update({ isEmailVerified: true })
      .where({ email })
      .then((response) => {
        console.log(response);
        resolve({ info: "Email verified" });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
        rej(err);
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
    let response = await knex
      .select("*")
      .from("accounts")
      .where({ accountID })
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      });
    let account = response[0];
    account = { ...account, isEmailVerified: !!account.isEmailVerified };
    let logins = await knex
      .select("*")
      .from("login_sessions")
      .where({ accountID });
    account = { ...account, isNewLogin: !(logins.length > 1) };
    resolve(account);
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
let changePassword = async ({ email, pass_hash }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("accounts")
      .update({
        pass_hash,
      })
      .where({ email })
      .on("query-error", function (error, obj) {
        console.log(error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        resolve({ info: "Password changed" });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
      });
  });
  return prom;
};

let addPreferences = async ({ accountID, preferences }) => {
  try {
    let trx = await knex.transactionProvider()();
    let [preferenceInfo] = await trx("preferences")
      .select("*")
      .where({ accountID });
    if (!preferenceInfo) {
      let prefs = [ ... preferences ];
      prefs=prefs.map(pref=>({...pref,createdOn:new Date()}))
      await trx("preferences").insert({ accountID, preferences:JSON.stringify(prefs) });
    } else {
      let originalPrefs=preferenceInfo.preferences
      let tosave=[]
      for (const pref of originalPrefs) {
        let indexOf=[...preferences].findIndex(pr=>pr.name=pref.name);
        console.log({indexOf})
        if (indexOf===-1) {
          tosave.push(pref)
          continue
        }
        let pr=[...preferences][indexOf]
        let merged={...pref, ...pr,updateOn:new Date()}
        tosave.push(merged)
        preferences.splice(indexOf,1)
      }
      tosave = [ ...tosave,...preferences ];
      tosave = JSON.stringify(tosave);
      await trx("preferences").update({ preferences:tosave }).where({ accountID });
    }
    await trx.commit();
    return { info: "Preference saved." };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let getPreferences = async (accountID) => {
  try {
    let trx = await knex.transactionProvider()();
    let [preferenceInfo] = await trx("preferences")
      .select("*")
      .where({ accountID });
    let { accountID: accID, ...rest } = preferenceInfo;
    preferenceInfo = { ...rest };
    await trx.commit();
    return preferenceInfo;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  createAccount as createAccountMysql,
  getAccount as getAccountMysql,
  getAccountByAccountID as getAccountByAccountIDMySQL,
  verifyEmail as verifyEmailMySQL,
  changePassword as changePasswordMySQL,
  addPreferences as addPreferencesMySQL,
  getPreferences as getPreferencesMySQL,
};

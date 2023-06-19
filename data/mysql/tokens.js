import logger from "../../utils/logger.js";
import { v4 as uuidV4 } from "uuid";
import fn  from "./conn.js";
let knex=fn()

/**
 *
 * @param {string} token
 */
let verifyAccessToken = async (token) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("tokens")
      .leftJoin("login_sessions", function () {
        this.on("tokens.clientID", "=", "login_sessions.clientID").andOn(
          "tokens.sessID",
          "=",
          "login_sessions.sessID"
        );
      })
      .where({ accessToken: token })
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        console.log(error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        let tokenData = response[0];
        resolve(tokenData);
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
 * @param {Array} regObj.accessToken
 * @param {string} regObj.sessID
 * @param {string} regObj.refreshToken
 * @param {string} regObj.clientID
 */
let saveTokens = async ({ sessID, clientID, accessToken, refreshToken }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("tokens")
      .insert({
        accessToken,
        clientID,
        sessID,
        refreshToken,
      })
      .on("query-error", function (error, obj) {
        logger.log("error", error);
        rej({ msg: "Error creating login session." });
      })
      .then((response) => {
        console.log(response);
        resolve({ sessID });
      })
      .catch((err) => {
        console.log({ err });
        logger.log({ level: "error", message: err });
        rej({ err });
      });
  });
  return prom;
};

let updateTokens = async ({
  oldRefreshToken,
  newAccessToken,
  newRefreshToken,
}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function name(trx) {
      let joinedData = await trx
        .select("*")
        .from("tokens")
        .leftJoin("login_sessions", function () {
          this.on("tokens.clientID", "=", "login_sessions.clientID").andOn(
            "tokens.sessID",
            "=",
            "login_sessions.sessID"
          );
        })
        .where({ refreshToken: oldRefreshToken })
        .on("query-error", function (error, obj) {
          logger.log("info", error);
          console.log(error);
          rej({ msg: "Unknown error" });
        });
      console.log({ joinedData });
      let joined = joinedData[0];
      if (!joined) {
        return rej({
          err: { msg: "Refresh token not found or out of session" },
        });
      }

      let rr = await trx("tokens")
        .update({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }).where({refreshToken:oldRefreshToken})
        .on("query-error", function (error, obj) {
          logger.log("error", error);
          rej({ msg: "Error creating login session." });
        });
      await trx.commit();
      resolve({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  });
  return prom;
};

let getTokensByRefreshTokens = async (refreshToken) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function(trx) {
      let response = await trx
        .select("*")
        .from("tokens")
        .where({ refreshToken })
        .where({ refreshToken })
        .on("query-error", function (error, obj) {
          logger.log("info", error);
          console.log(error);
          rej({err:{ msg: "Unknown error"} });
        });
      let tokenData = response[0];
      if (!tokenData) {
        rej({err: {msg: "Refresh token not valid."} });
      }
      resolve(tokenData);
    });
  });
  return prom;
};

export {
  verifyAccessToken as verifyAccessTokenMySql,
  saveTokens as saveTokensMySQL,
  updateTokens as updateTokensMySql,
  getTokensByRefreshTokens as getTokensByRefreshTokensMySQL,
};

import logger from "../../utils/logger.js";
import { DateTime } from "luxon";
import fn  from "./conn.js";
let knex=fn()

/**
 *
 * @param {string} token
 */
let verifyAccessToken = async (token) => {
  let prom = new Promise(async (resolve, rej) => {
    console.log({ token });
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
        console.log(response);
        let tokenData = response[0];
        resolve(tokenData);
      })
      .catch((err) => {
        console.log({ level: "info", message: err });
        rej(err);
      });
  });
  return prom;
};

/**
 *
 * @param {object} regObj
 * @param {"verification"|"login_access"|"password_recovery"} regObj.tokenType
 * @param {string} regObj.token
 * @param {"email"|"mobile"|"password"} regObj.scope
 * @param {number} regObj.ttl
 * @param {string} regObj.recipient
 */
let saveTempToken = async ({ tokenType, token, scope, recipient, ttl }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("temp_tokens")
      .insert({
        tokenType,
        token,
        scope,
        ttl,
        recipient,
        expiresAt: DateTime.now().plus({ minute: 15 }).toJSDate(),
      })
      .on("query-error", function (error, obj) {
        logger.log("error", error);
        rej({ msg: "Error creating login session." });
      })
      .then((response) => {
        console.log(response);
        resolve({ token });
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
        .insert({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        })
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

let verifyTempToken = async ({ token, tokenType, recipient }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      let response = await trx
        .select("*")
        .from("temp_tokens")
        .where({ token, tokenType, recipient })
        .andWhereRaw(` state is null`)
        .andWhere("expiresAt", ">", new Date())
      console.log({ response });
      let tokenData = response[0];
      if (!tokenData) {
      return  rej({ msg: "token not valid." });
      }
      let state = "verified";
      let verifiedAt = new Date();
      await trx("temp_tokens")
        .update({ state, verifiedAt })
        .where({ token, tokenType, recipient });
      await trx.commit();
      resolve({ ...tokenData, state, verifiedAt });
    });
  });
  return prom;
};

export {
  verifyAccessToken as verifyAccessTokenMySql,
  saveTempToken as saveTempTokenMySQL,
  updateTokens as updateTokensMySql,
  verifyTempToken as verifyTempTokenMySQL,
};

import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { v4 as uuidV4 } from "uuid";
import { DateTime, Interval } from "luxon";
/**
 *
 * @param {object} regObj
 * @param {[{name:"success"|"failed"|"expired"|"inactive",archivedOn:knex.fn.now()}]} regObj.factors
 * @param {boolean} regObj.accountID
 * @param {string} regObj.lastSessID
 * @param {string} regObj.clientID
 */
let createLoginSession = async ({
  factors,
  accountID,
  lastSessID,
  clientID,
}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async (trx) => {
      try {
        let activeSessions = await trx
          .select("*")
          .from("login_sessions")
          .where({ accountID })
          .andWhereRaw(
            `(JSON_EXTRACT(state,'$.name')='active' OR JSON_EXTRACT(state,'$.name')!='initiated') and end_by is NULL OR end_by > NOW() `
          )
          .on("query-error", function (error, obj) {
            logger.log("info", error);
            console.log(error);
            return rej({ err: { msg: "Unknown error" } });
          });
        if (activeSessions.length > 3) {
          return rej({
            err: { msg: "Exceeded maximum allowed active login" },
          });
        }
        let sessID = uuidV4();
        await trx("login_sessions")
          .insert({
            sessID,
            accountID,
            clientID,
            lastSessID,
            state: { name: "initiated", initialized: new Date() },
            factors_info: { factors },
          })
          .on("query-error", function (error, obj) {
            logger.log("error", error);
            return rej({ msg: "Error creating login session." });
          });
        await trx.commit();
        console.log({ trx: trx.isCompleted() });
        return resolve({ sessID });
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  });
  return prom;
};

/**
 *
 * @param {object} regObj
 * @param {"basic"|"mobile"|"email"} regObj.factorName
 * @param {string} regObj.sessID
 * @param {string} regObj.clientID
 * @param {"success"|"failed"|"expired"|"inactive"} regObj.newFactorStatusName
 */
let updateFactorInfoState = async ({
  factorName,
  sessID,
  clientID,
  newFactorStatusName,
}) => {
  let prom = new Promise(async (resolve, reject) => {
    knex.transaction(async function (trx) {
      try {
        let sessions = await trx
          .select("*")
          .from("login_sessions")
          .where({ clientID, sessID })
          .on("query-error", function (error, obj) {
            console.log(error);
            return rej({ msg: "Error." });
          });
        let session = sessions[0];
        if (!session) {
          return reject({ err: { msg: "No account matches" } });
        }
        let { factors_info } = session;
        if (!factors_info) {
          return reject({ err: { msg: "No factors info found" } });
        }
        let particularFactor = factors_info?.factors.find(
          (fac) => fac.name === factorName
        );
        if (!particularFactor) {
          return reject({ err: { msg: `No factor ${factorName} info found` } });
        }

        if (particularFactor.retryCount > 3) {
          return reject({ err: { msg: `Retry count has exceeded 3` } });
        }

        let activeStatus = particularFactor.activeStatus;
        if (activeStatus) {
          particularFactor.statusHistory = [...particularFactor.statusHistory];
          particularFactor.statusHistory.push({
            name: activeStatus,
            archivedOn: new Date(),
          });
        }
        if (activeStatus === "failed") {
          let retryCount = particularFactor?.retryCount || 0;
          particularFactor.retryCount = retryCount + 1;
        }

        particularFactor.activeStatus = newFactorStatusName;
        let res = await trx("login_sessions")
          .where({ clientID, sessID })
          .update({ factors_info: JSON.stringify(factors_info) });
        console.log({ res });
        await trx.commit();
        resolve({ res });
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  });
  return prom;
};

let startLoginSession = async ({
  accountID,
  sessID,
  clientID,
  newFactorStatusName,
}) => {
  let prom = new Promise(async (resolve, reject) => {
    knex.transaction(async function (trx) {
      try {
        let sessions = await trx
          .select("*")
          .from("login_sessions")
          .where({ clientID, sessID, accountID })
          .on("query-error", function (error, obj) {
            console.log(error);
            return rej({ msg: "Error." });
          });
        let session = sessions[0];
        if (!session) {
          return reject({
            err: {
              msg: "No login session matches current sessID and clientID.",
            },
          });
        }
        let { state, factors_info } = session;
        let unVerifiedFactors = factors_info?.factors.find(
          (fac) => fac.activeStatus !== "success"
        );
        if (unVerifiedFactors?.length > 0) {
          return reject({ err: { msg: `Some factors no yet verified` } });
        }
        if (state?.name === "active") {
          //return reject({ err: { msg: "Session already started" } });
        } else if (state?.name === "initiated") {
          state.name = "active";
        }

        if (session?.end_by && session.end_by < new Date()) {
          return reject({ err: { msg: `Session already ended.` } });
        }
        let curTime = new Date();
        let started_on;
        let renewed_on;
        if (session.started_on) {
          renewed_on = curTime;
        } else {
          started_on = curTime;
        }
        let end_by = DateTime.now().plus({ minute: 15 }).toJSDate();
        let duration = Interval.fromDateTimes(
          session.started_on || started_on,
          end_by
        ).count("minutes");
        let res = await trx("login_sessions")
          .where({ clientID, sessID })
          .update({
            started_on,
            end_by,
            renewed_on,
            duration: duration,
            state: JSON.stringify(state),
          });
        console.log({ res });
        await trx.commit();
        resolve({ res });
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  });
  return prom;
};

let stopLoginSession = async ({ accountID, sessID, clientID }) => {
  let prom = new Promise(async (resolve, reject) => {
    knex.transaction(async function (trx) {
      try {
        let sessions = await trx
          .select("*")
          .from("login_sessions")
          .where({ clientID, sessID, accountID })
          .on("query-error", function (error, obj) {
            console.log(error);
            return rej({ msg: "Error." });
          });
        let session = sessions[0];
        if (!session) {
          return reject({
            err: {
              msg: "No login session matches current sessID and clientID.",
            },
          });
        }
        let { state, factors_info } = session;
        if (state?.name === "ended") {
          return reject({ err: { msg: "Session already ended" } });
        } else if (state?.name === "active") {
          state.name = "ended";
          state.ended_by = new Date();
        }
        let res = await trx("login_sessions")
          .where({ clientID, sessID })
          .update({
            state: JSON.stringify(state),
          });
        await trx.commit();
        resolve({ res });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  });
  return prom;
};

let stopAllLoginSession = async ({ accountID }) => {
  let prom = new Promise(async (resolve, reject) => {
    knex.transaction(async function (trx) {
      let sessions = await trx
        .select("*")
        .from("login_sessions")
        .where({ accountID })
        .on("query-error", function (error, obj) {
          console.log(error);
          return rej({ msg: "Error." });
        });
      let session = sessions[0];
      if (!session) {
        return reject({
          err: { msg: "No login session matches current sessID and clientID." },
        });
      }
      let { state, factors_info } = session;
      if (state?.name === "ended") {
        return reject({ err: { msg: "Session already ended" } });
      } else if (state?.name === "active") {
        state.name = "ended";
        state.ended_by = new Date();
      }
      let res = await trx("login_sessions")
        .where({ accountID })
        .update({
          state: JSON.stringify(state),
        });
      await trx.commit();
      resolve({ res });
    });
  });
  return prom;
};

let getActiveLogin = async (accountID) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("login_sessions")
      .where({ accountID })
      .andWhereRaw(" end_by is NULL OR `end_by` < NOW()")
      .andWhereRaw(
        `JSON_EXTRACT(state,'$.name')='active' OR JSON_EXTRACT(state,'$.name')='initiated'`
      )
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        console.log(error);
        rej({ err: { msg: "Unknown error" } });
      })
      .then((response) => {
        let activeSession = response[0];
        resolve({ session: activeSession });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
        rej(err);
      });
  });
  return prom;
};

let getSessionData = async ({ sessID, clientID }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("login_sessions")
      .where({ sessID, clientID })
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        console.log(error);
        rej({ err: { msg: "Unknown error" } });
      })
      .then((response) => {
        let session = response[0];
        resolve({ session });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
        rej(err);
      });
  });
  return prom;
};

let getUnverifiedFactors = async ({ sessID, clientID }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("login_sessions")
      .where({ sessID, clientID })
      .andWhereRaw(" end_by is NULL OR `end_by` < NOW()")
      .andWhereRaw(`JSON_EXTRACT(state,'$.name')='active'`)
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        console.log(error);
        rej({ err: { msg: "Unknown error" } });
      })
      .then((response) => {
        let activeSession = response[0];
        let factors = activeSession?.factors_info?.factors;
        let unverifiedFactors = factors.filter(
          (fac) => fac.activeStatus !== "success"
        );
        resolve({ unverifiedFactors });
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
        rej(err);
      });
  });
  return prom;
};

export {
  createLoginSession as createLoginSessionMysql,
  getActiveLogin as getActiveLoginMysql,
  updateFactorInfoState as updateFactorInfoStateMySQL,
  getUnverifiedFactors as getUnverifiedFactorsMysql,
  startLoginSession as startLoginSessionMySQL,
  stopAllLoginSession as stopAllLoginSessionMySQL,
  stopLoginSession as stopLoginSessionMySQL,
  getSessionData as getSessionDataMySQL,
};

import logger from "../../utils/logger.js";
import knex from "./conn.js";

/**
 *
 * @param {object} regObj
 * @param {string} regObj.clientID
 * @param {string} regObj.sessID
 * @param {string} regObj.clientSecret
 * @param {Array} regObj.redirectURIs
 */
let createClientOAUTHData = async ({ sessID, clientID,clientSecret,redirectURIs,
}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("oauth_data")
      .insert({clientID,sessID,clientSecret, redirectURIs,})
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        rej({ msg: "Unable to creating OAUTH data" });
      })
      .then((response) => {
        console.log(response);
        resolve({accountID: clientID});
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
 * @param {string} clientID
 */
let getClientOAUTHDataByID = async (clientID) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("oauth_data").where({clientID})
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        console.log(response);
        let clientOAUTHData=response[0]
        resolve(clientOAUTHData);
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        //throw error;
      });
  });
  return prom;
};
export {createClientOAUTHData as createClientOAUTHDataMySql,getClientOAUTHDataByID as getClientOAUTHDataByIDMySQL };

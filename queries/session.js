import {
  createLoginSessionMysql,
  getActiveLoginMysql,
  getUnverifiedFactorsMysql,
  startLoginSessionMySQL,
  stopLoginSessionMySQL,
  getSessionDataMySQL,
  stopAllLoginSessionMySQL,
} from "../data/index.js";

let createLoginSession = async ({ accountID, factors, clientID }) => {
  try {
    let res = await createLoginSessionMysql({ accountID, factors, clientID });
    return { ...res, clientID };
  } catch (error) {
    throw error;
  }
};

let stopLoginSession = async ({ accountID, sessID, clientID }) => {
  try {
    return await stopLoginSessionMySQL({ accountID, sessID, clientID });
  } catch (error) {
    throw error;
  }
};

let stopAllLoginSession = async ({ accountID, sessID, clientID }) => {
  try {
    return await stopAllLoginSessionMySQL({ accountID, sessID, clientID });
  } catch (error) {
    throw error;
  }
};
let getActiveLogin = async (accountID) => {
  return await getActiveLoginMysql(accountID);
};

let getUnverifiedFactors = async ({ sessID, clientID }) => {
  return await getUnverifiedFactorsMysql({ sessID, clientID });
};
let startLoginSession = async ({ accountID, clientID, sessID }) => {
  return await startLoginSessionMySQL({ accountID, sessID, clientID });
};
let getSessionData = async ({ clientID, sessID }) => {
  return await getSessionDataMySQL({ sessID, clientID });
};


export {
  createLoginSession,
  getActiveLogin,
  getUnverifiedFactors,
  startLoginSession,
  stopLoginSession,
  getSessionData,
  stopAllLoginSession,
};

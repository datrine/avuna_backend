import { createAccountMysql, createUserInfoMySql, getAccountMysql, getUserBioByAccountIDMySql} from "../data/index.js";
import bcrypt from "bcrypt";

let createUserBio = async (obj) => {
  try {
    let mysqlCreationRes = await createUserInfoMySql(obj);
    return mysqlCreationRes;
  } catch (error) {
    return {err:error}
  }
};

let getUserBioByAccountID = async (accountID) => {
   return await getUserBioByAccountIDMySql(accountID);
};

export { getUserBioByAccountID ,createUserBio};

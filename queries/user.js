import { createAccountMysql, createUserInfoMySql, getAccountMysql, getUserBioByAccountIDMySql} from "../data/index.js";
import bcrypt from "bcrypt";
import { editUserBioMysql } from "../data/mysql/user.js";

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

let editUserBio = async (...obj) => {
  try {
    return await editUserBioMysql(...obj);
  } catch (error) {
    throw error;
  }
};
export { getUserBioByAccountID ,createUserBio,editUserBio};

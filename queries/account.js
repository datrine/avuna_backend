import { addRolesToAccountMySQL, createAccountMysql, getAccountByAccountIDMySQL, getAccountMysql} from "../data/index.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/email_service/index.js";

let createAccount = async (obj) => {
  try {
    let { email, password ,account_type,roles,roleCreatorID} = obj;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    let mysqlCreationRes = await createAccountMysql({
      email,
      isEmailVerified: false,
      pass_hash: hash,account_type,roles
    });
    if (roleCreatorID) {
      let accountID=mysqlCreationRes?.accountID;
      addRolesToAccountMySQL({accountID,creatorID:roleCreatorID,newRoles:roles})
    }
    return mysqlCreationRes;
  } catch (error) {
    console.log(error)
    return {err:error}
  }
};

let getAccountByEmailAddress = async (email) => {
 return await getAccountMysql(email)
};

let getAccountByAccountID = async (accountID) => {
  return await getAccountByAccountIDMySQL(accountID)
 };

export { createAccount ,getAccountByEmailAddress,getAccountByAccountID};

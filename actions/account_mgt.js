import {
  createLoginSession,
  getAccountByEmailAddress,
  getActiveLogin,
  getUnverifiedFactors,
  getUserBioByAccountID,
  startLoginSession,
  stopAllLoginSession,
  stopLoginSession,
} from "../queries/index.js";
import bcrypt from "bcrypt";
import { generateEmailToken, generatePasswordToken, getLoginTokens, saveEmailVerificationToken, savePasswordChangeToken, saveTokens } from "./token_mgt.js";
import {  changePasswordMySQL, updateFactorInfoStateMySQL } from "../data/index.js";
import { v4 as uuidV4 } from "uuid";
import { sendEmail } from "../utils/email_service/index.js";

const basicLogin = async ({ password, email }) => {
  try {
    let account = await getAccountByEmailAddress(email);
    if (!account) {
      return { err: { msg: "No such account exists!" } };
    }
    let isCorrectPass = await bcrypt.compare(password, account.pass_hash);
    if (!isCorrectPass) {
      return { err: { msg: "Email or password not correct" } };
    }
    let factors = [
      { name: "basic", activeStatus: "initialized", statusHistory: [] },
    ];
    let clientID=uuidV4()
    let {
      sessID,
    } = await createLoginSession({
      factors,clientID,
      accountID: account.accountID,
    });
     await updateFactorInfoStateMySQL({
      factorName: "basic",
      sessID,
      clientID,
      newFactorStatusName: "success",
    });
    
    let { unverifiedFactors } = await getUnverifiedFactors({
      sessID,
      clientID,
    });
    console.log({ unverifiedFactors });
    if (unverifiedFactors?.length > 0) {
      return { unverifiedFactors, sessID, clientID };
    }
    await startLoginSession({accountID:account.accountID,sessID,clientID})
    let tokens = await getLoginTokens({ sessID, clientID });
    let { accessToken, refreshToken } = tokens;
    let res = await saveTokens({ clientID, sessID, accessToken, refreshToken });
    return { ...tokens,clientID,sessID };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const logout = async ({accountID,sessID,clientID }) => {
  try {
     await stopLoginSession({accountID,sessID,clientID});
    return {loggedout:true}
  } catch (error) {
    console.log(error);
    return error;
  }
};

const allSessionLogout = async ({accountID,sessID,clientID }) => {
  try {
     await stopAllLoginSession({accountID,sessID,clientID});
    return {loggedout:true}
  } catch (error) {
    console.log(error);
    return error;
  }
};

const initiateEmailVerification = async ({account,}) => {
  try {
    let token = generateEmailToken();
    let {email,}=account
    let {f_name,l_name}= await getUserBioByAccountID(account.accountID)
    let resOf = await saveEmailVerificationToken({
      token,
      email,
    });
    let tokenLink=`${process.env.SERVER_URL}/verify/token?token=${token}&email=${email}`
   let emailResult= await sendEmail({
      recipient: email,
      locals: { f_name,l_name,token,tokenLink },
      template: "email_verification",
    });
    return {info:"email sent"}
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const initiatePasswordChange = async ({account,}) => {
  try {
    let token = generatePasswordToken();
    let {email,}=account
    let {f_name,l_name}= await getUserBioByAccountID(account.accountID)
    let resOf = await savePasswordChangeToken({
      token,
      email,
    });
    let tokenLink=`${process.env.SERVER_URL}/api/accounts/password/recovery/change?token=${token}&email=${email}`
   let emailResult= await sendEmail({
      recipient: email,
      locals: { f_name,l_name,token,tokenLink },
      template: "password_recovery",
    });
    return {info:"email sent"}
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const completePasswordChange = async ({email,password}) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    changePasswordMySQL({email,pass_hash:hash});

    return {info:"Password changed"}
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export { basicLogin ,logout,initiateEmailVerification,initiatePasswordChange,allSessionLogout,completePasswordChange};

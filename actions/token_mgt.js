import * as jose from "jose";
import { nanoid, customAlphabet } from "nanoid";
import {
  getTokensByRefreshTokensMySQL,
  saveTempTokenMySQL,
  saveTokensMySQL,
  updateTokensMySql,
  verifyAccessTokenMySql,
  verifyTempTokenMySQL,
} from "../data/index.js";
import { getPEMKey } from "../keys/key_management.js";

let getLoginTokens = async ({ sessID, clientID }) => {
  let payload = {
    sub: clientID,
    sessID,
  };
  let keyObj = await getPEMKey("./my_private.key");
  const ecPrivateKey = await jose.importPKCS8(keyObj, "ES384");
  const accessToken = await new jose.SignJWT(payload)
    .setSubject(clientID)
    .setProtectedHeader({ alg: "ES384" })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    //.setExpirationTime("3m")
    .sign(ecPrivateKey);
  let refreshToken = nanoid();
  return { accessToken, refreshToken };
};

let generateOUATHTokens = async ({ username, email, id }) => {
  let accessToken = await getLoginTokens({ username, email, id });
  let refreshToken = await getRefreshToken({ id, accessToken });
  return { accessToken, refreshToken };
};

let validateAccessToken = async ({ token }) => {
  try {
    let keyObj = await getPEMKey("./my_public.crt");
    const ecPublicKey = await jose.importSPKI(keyObj, "ES384");
    let res = await jose.jwtVerify(token, ecPublicKey);
    //let{payload,protectedHeader}=res;
    return res;
  } catch (error) {
    throw error;
  }
};

let verifyAccessToken = async ({ token }) => {
  try {
    let res = await verifyAccessTokenMySql(token);
    //let{payload,protectedHeader}=res;
    return res;
  } catch (error) {
    throw error;
  }
};

let refreshTokens = async ({ refreshToken }) => {
  try {
    let tokensDetail = await getTokensByRefreshTokensMySQL(refreshToken);
    if (!tokensDetail) {
      throw new Error({
        err: { msg: "No data associated with refresh token" },
      });
    }
    let { sessID, clientID } = tokensDetail;
    let newTokens = await getLoginTokens({ sessID, clientID });
    await updateTokensMySql({
      oldRefreshToken: refreshToken,
      newAccessToken: newTokens.accessToken,
      newRefreshToken: newTokens.refreshToken,
    });
    return newTokens;
  } catch (error) {
    throw error;
  }
};

let saveTokens = async ({ clientID, sessID, accessToken, refreshToken }) => {
  try {
    return await saveTokensMySQL({
      clientID,
      accessToken,
      refreshToken,
      sessID,
    });
  } catch (error) {
    throw error;
  }
};

let generateEmailToken = () => {
  let token = customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstwxyz",
    100
  )();
  console.log({ token });
  return token;
};

let generatePasswordToken = () => {
  let token = customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstwxyz",
    200
  )();
  console.log({ token });
  return token;
};
let saveEmailVerificationToken = async ({ token, email }) => {
  return await saveTempTokenMySQL({
    tokenType: "verification",
    token,
    scope: "mobile",
    recipient: email,
    ttl: 15,
  });
};

let savePasswordChangeToken = async ({ token, email }) => {
  return await saveTempTokenMySQL({
    tokenType: "password_recovery",
    token,
    scope: "password",
    recipient: email,
    ttl: 15,
  });
};
let verifyTempToken = async ({ token, tokenType, recipient }) => {
  return await verifyTempTokenMySQL({ token, tokenType, recipient });
};
export {
  generateOUATHTokens,
  validateAccessToken,
  refreshTokens,
  getLoginTokens,
  verifyAccessToken,
  saveTokens,
  verifyTempToken,
  saveEmailVerificationToken,
  generateEmailToken,
  generatePasswordToken,
  savePasswordChangeToken,
};

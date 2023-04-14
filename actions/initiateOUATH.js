import { createClientOAUTHData, getAccountByEmailAddress } from "../queries/index.js";
import bcrypt from "bcrypt";
import { generateSecret } from "../utils/oauth/index.js";

const initiateOAUTH = async (sess_id, client_id,redirect_uris) => {
  try {
  let secret= await generateSecret()
  let res= await  createClientOAUTHData({sessID:sess_id,clientID:client_id,redirectURIs:redirect_uris,clientSecret:secret})
    return {client_id,client_secret:secret,redirect_uris}
  } catch (error) {
    console.log(error)
  }
};

export { initiateOAUTH };

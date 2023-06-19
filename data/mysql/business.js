import logger from "../../utils/logger.js";
import { v4 as uuidV4 } from "uuid";
import fn  from "./conn.js";
let knex=fn()

/**
 *
 * @param {object} regObj
 * @param {string} regObj.name
 * @param {boolean} regObj.sector
 * @param {string} regObj.phone_num
 * @param {number} regObj.size
 * @param {number} regObj.creatorID
 */
let createBusiness = async ({ name, sector, phone_num, size, creatorID }) => {
  let businessID = uuidV4();
  try {
    let creationRes = await knex("businesses").insert({
      businessID,
      name,
      phone_num,
      size,
      creatorID,
       sector,
    });
    return creationRes;
  } catch (error) {
    console.log(error);
    throw { msg: error };
  }
};

/**
 *
 * @param {object} regObj
 * @param {string} regObj.email
 * @param {string} regObj.pass_hash
 */
let editBusiness = async ({ businessID, editorID, updates = {} }) => {
  try {
    let updateRes = await knex("accounts")
      .update({
        ...updates,
      })
      .where({ businessID });
    return updateRes;
  } catch (error) {
    console.log(error);
    throw { msg: error };
  }
};

export {
  createBusiness as createBusinessMySQL,
  editBusiness as editBusinessMySQL,
};

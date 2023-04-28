import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { v4 as uuidV4 } from "uuid";

/**
 *
 * @param {object} regObj
 * @param {string} regObj.name
 * @param {boolean} regObj.sector
 * @param {string} regObj.phone_num
 * @param {number} regObj.size
 * @param {number} regObj.creatorID
 */
let createQuiz = async ({ name, sector, phone_num, size, creatorID }) => {
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
let getQuizzes = async ({ limit, filters = {} }) => {
  try {
    let updateRes = await knex("accounts")
      .update({
        ...updates,
      })
      .where({ businessID }).limit(limit);
    return updateRes;
  } catch (error) {
    console.log(error);
    throw { msg: error };
  }
};

let createQuizMySQL=async({title,desc,courseID,numOfQuestions,durationMode,contentID,creatorID})=>{
  try {
    
  } catch (error) {
    console.log(error)
    throw error
  }
}
export {
  createQuiz as createQuizMySQL,
  editBusiness as editBusinessMySQL,
};

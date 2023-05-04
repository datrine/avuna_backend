import logger from "../../utils/logger.js";
import knex from "./conn.js";

/**
 *
 * @param {object} regObj
 * @param {string} regObj.accountID
 * @param {string} regObj.f_name
 * @param {string} regObj.l_name
 * @param {"female"|"male"} regObj.sex
 * @param {"20-29"|"30-39"|"40-49"|"50-59"} regObj.age_range
 * @param {string} regObj.country
 */
let createUserInfo = async ({
  accountID,
  f_name,
  l_name,
  sex,
  country,
  age_range,
}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex("user_bios")
      .insert({ accountID, f_name, l_name, age_range, sex, country })
      .on("query-error", function (error, obj) {
        if (
          error.code === "ER_DUP_ENTRY" ||
          new String(error.message).toLocaleLowerCase().includes("duplicate")
        ) {
          return rej({ msg: "user bio for this account already exists." });
        }
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        console.log(response);
        resolve({ accountID });
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
 * @param {string} accountID
 */
let getUserBioByAccountID = async (accountID) => {
  let prom = new Promise(async (resolve, rej) => {
    knex
      .select("*")
      .from("user_bios")
      .where({ accountID })
      .on("query-error", function (error, obj) {
        logger.log("info", error);
        rej({ msg: "Unknown error" });
      })
      .then((response) => {
        let userBio = response[0];
        userBio = { ...userBio, isEmailVerified: !!userBio.isEmailVerified };
        let prof_pic_path = userBio.prof_pic_info?.key;
        prof_pic_path = prof_pic_path
          ? `${process.env.SERVER_URL}/api/media/${userBio.prof_pic_info.key}`
          : "";
        userBio.prof_pic_path = prof_pic_path;
        resolve(userBio);
      })
      .catch((err) => {
        logger.log({ level: "info", message: err });
        rej(err);
      });
  });
  return prom;
};

let editUserBio = async ({ editorID, accountID, updates }) => {
  try {
    console.log({ updates });
    let hasCol = await knex.schema.hasColumn("user_bios", "prof_pic_info");
    if (!hasCol) {
      await knex.schema.alterTable("user_bios", function (table) {
        table.json("prof_pic_info");
      });
    }
    let updateRes = await knex("user_bios")
      .update({ ...updates })
      .where({ accountID });
    return updateRes;
  } catch (error) {
    throw error;
  }
};
export {
  createUserInfo as createUserInfoMySql,
  getUserBioByAccountID as getUserBioByAccountIDMySql,
  editUserBio as editUserBioMysql,
};

import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { v4 as uuidV4 } from "uuid";
import { checkPermissionMySQL } from "./rbac.js";

/**
 *
 * @param {string} identifier
 */
let addContent = async ({ creatorID, ...obj }) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      try {
        let { trx: trxFromHasPermission } = await checkPermissionMySQL(
          { accountID: creatorID, permission: "can_add_content" },
          trx
        );
        trx = trxFromHasPermission;
        console.log({ obj });
        let [course] = await trx("courses")
          .select("*")
          .where({ courseID: obj.courseID });
        if (!course) {
          throw "No course matches";
        }
        let contentID = uuidV4();
        await trx.insert({ contentID, ...obj, creatorID }).into("content");
        resolve({ contentID });
      } catch (error) {
        console.log(error);
        rej(error);
      }
    });
  });
  return prom;
};

let editContent = async ({ editorID, ...obj }) => {
  knex.transaction(async function (trx) {
    try {
      let { courseID, ...rest } = rest;
      let { trx: trxFromHasPermission } = checkPermissionMySQL(
        { accountID: editorID, permission: "can_edit_course" },
        trx
      );
      trx = trxFromHasPermission;
      let res = await trx("courses")
        .update({ ...obj })
        .where({ courseID })
        .on("query-error", function (error, obj) {
          logger.log("info", error);
          rej({ msg: "Unknown error" });
        });
      resolve({ info: "Info " });
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

let getLessons = async (obj) => {
  try {
    console.log(obj);
    let lessons = await knex("content")
      .select("*")
      .where({ ...obj });
      return lessons
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export {
  addContent as addContentMySQL,
  editContent as editContentMySQL,
  getLessons as getLessonsMySQL,
};

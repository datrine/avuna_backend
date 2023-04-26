import logger from "../../utils/logger.js";
import knex from "./conn.js";
import { v4 as uuidV4 } from "uuid";
import { checkPermissionMySQL } from "./rbac.js";

/**
 *
 * @param {string} identifier
 */
let createCourse = async ({creatorID, ...obj}) => {
  let prom = new Promise(async (resolve, rej) => {
    knex.transaction(async function (trx) {
      try {
        let { trx: trxFromHasPermission } =await checkPermissionMySQL(
          { accountID: creatorID, permission: "can_create_course" },
          trx
        );
        trx = trxFromHasPermission;
        let courseID = uuidV4();
        await trx
          .insert({ courseID, ...obj,creatorID })
          .into("courses")
          .on("query-error", function (error, obj) {
            logger.log("info", error);
            rej({ msg: "Unknown error" });
          });
        resolve({ courseID });
      } catch (error) {
        console.log(error);
        rej(error) ;
      }
    });
  });
  return prom;
};

let editCourse = async ({ editorID, ...obj }) => {
  let prom = new Promise(async (resolve, rej) => {
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
  });});
  return prom;
};

let getCourses = async ({ filters }) => {
  let prom = new Promise(async (resolve, rej) => {
  knex.transaction(async function (trx) {
    try {
     /* let { courseID, ...rest } = rest;
      let { trx: trxFromHasPermission } = checkPermissionMySQL(
        { accountID: editorID, permission: "can_get_courses" },
        trx
      );
      trx = trxFromHasPermission; */
      let courses = await trx("courses")
        .select("*")
      resolve({ courses });
    } catch (error) {
      console.log(error);
      throw error;
    }
  });});
  return prom
};
export { createCourse as createCourseMySQL, editCourse as editCourseMySQL,getCourses as getCoursesMySQL };

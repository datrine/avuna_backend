import { nanoid } from "nanoid";
import knex from "./conn.js";
/**
 * @param {object} obj
 * @param {object} obj.cart
 * @param {string} obj.courseID
 * @param {"active"|"inactive"} obj.state
 * @param {string} obj.accountID
 *
 */
let createEnrollment = async ({
  courseID,
  state = "active",
  accountID,
  cartID,
  paymentID,
}) => {
  try {
    let enrollmentID = nanoid();
    state = JSON.stringify({ name: state, setOn: new Date() });
    let responseOfCreate = await knex("enrollments").insert({
      state,
      enrollmentID,
      accountID,
      courseID,
      paymentID,
      cartID,
    });
    return { info: "enrollment created", courseID };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let getMyActiveEnrollments = async (accountID) => {
  try {
    let enrollments = await knex("enrollments")
      .select("*")
      .whereRaw(
        ` JSON_EXTRACT(state, "$.name")='active' and accountID='${accountID}'`
      );
    return enrollments;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let getEnrollmentInfo = async (enrollmentID) => {
  try {
    let [cart] = await knex("enrollments")
      .select("*")
      .whereRaw(`enrollmentID='${enrollmentID}'`);
    return cart;
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

/**
 * @param {object} obj
 * @param {string} obj.courseID
 * @param {"active"|"inactive"} obj.state
 * @param {string} obj.accountID
 *
 */
let enrollCourse = async ({ courseID, accountID, state = "active" }) => {
  try {
    console.log({courseID,accountID,state})
    let trx = await knex.transactionProvider()();
    let [courseInfo] = await trx("courses").where({ courseID });
    if (!courseInfo) {
      throw { msg: "No course matches courseID" };
    }
    let [existingEnrollment] = await trx("enrollments").where({
      courseID,
      accountID,
    });
    if (!existingEnrollment) {
      if (courseInfo.price && courseInfo.accessType !== "full_free") {
        throw { msg: "Need to pay for enrollment" };
      }
      let enrollmentID = nanoid();
      state = JSON.stringify({ name: state, setOn: new Date() });
      await trx("enrollments").insert({
        state,
        enrollmentID,
        accountID,
        courseID,
      });
      await trx.commit()
      return { info: "enrollment created", courseID };
    } else {
      if (!existingEnrollment.state?.name === "active") {
        console.log("Existing Enrollment not active");
        let enrollmentID = nanoid();
        state = JSON.stringify({ name: state, setOn: new Date() });
        await trx("enrollments").insert({
          state,
          enrollmentID,
          accountID,
          courseID,
        });
        await trx.commit()
        return { info: "enrollment created", courseID };
      } else {
        console.log("Existing active Enrollment");
        throw { msg: "Existing active Enrollment" };
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  createEnrollment as createEnrollmentMySQL,
  getMyActiveEnrollments as getMyActiveEnrollmentsMySQL,
  getEnrollmentInfo as getEnrollmentInfoMySQL,
  enrollCourse as enrollCourseMySQL,
};

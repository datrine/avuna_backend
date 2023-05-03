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
let createEnrollment = async ({ courseID, state = "active", accountID }) => {
  try {
    let enrollmentID = nanoid();
    state = JSON.stringify({ name: state, setOn: new Date() });
    let responseOfCreate = await knex("enrollments").insert({
      state,
      enrollmentID,
      accountID,
      courseID,
    });
    return { info: "enrollment created", cartID };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let getMyActiveEnrollments = async (accountID) => {
  try {
    let carts = await knex("enrollments")
      .select("*")
      .whereRaw(
        ` JSON_EXTRACT(state, "$.name")='active' and accountID='${accountID}'`
      );
    carts = carts.map((cart) => ({ ...cart.cart, cartID: cart.cartID }));
    return carts;
  } catch (error) {}
};

let getEnrollmentInfo = async (enrollmentID) => {
  try {
    let [cart] = await knex("enrollments").select("*").whereRaw(`enrollmentID='${enrollmentID}'`);
    return cart;
  } catch (error) {
    console.log({error})
    throw error
  }
};
export {
  createEnrollment as createEnrollmentMySQL,
  getMyActiveEnrollments as getMyActiveEnrollmentsMySQL,
  getEnrollmentInfo as getEnrollmentInfoMySQL,
};

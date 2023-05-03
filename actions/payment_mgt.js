import { nanoid } from "nanoid";
import { initializePaymentSuccess } from "../utils/templates/paystack.js";
import {
  createEnrollmentMySQL,
  getPaymentInfoByReferenceIDMySQL,
  saveInitializedPaymentMySQL,
} from "../data/index.js";
import fetch from "node-fetch";
import { enrollToCourse } from "./courses_mgt.js";
import { getCartInfo, updateItemStatus } from "./cart_mgt.js";

let initiatePayment = async ({ accountID, email, amount, itemID }) => {
  try {
    let reference = nanoid();
    let response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        port: 443,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email,
          amount: amount * 100,
          reference,
          callback_url: `${process.env.SERVER_URL}/api/payments/paystack/callback`,
        }),
      }
    );
    if (!response.ok) {
      throw await response.text();
    }
    /**
     * @type {initializePaymentSuccess}
     */
    let data = await response.json();
    //save payment
    let paymentID = await saveInitializedPaymentMySQL({
      accountID,
      referenceID: reference,
      itemID,
      amount,
      state: "initialized",
    });
    //update cart state


    return { ...data, paymentID };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let updateSuccessfulPaymentInfo = async ({ referenceID }) => {
  try{
//get paymentInfo which matches referenceID
    let paymentInfo=await getPaymentInfoByReferenceIDMySQL()
    let {itemID:cartID}=paymentInfo;
    let cart=await getCartInfo(cartID);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
let sortPaidItems = async ({ cartItems = [], accountID, cartID }) => {
  try {
    for (const item of cartItems) {
      if (item.type === "enrollment") {
        //create enrollment
        let responseOfEnrollment = await enrollToCourse({
          courseID: item.itemID,
          accountID,
          state: "active",
        });
        //mark item as fulfilled
        let updateRes = await updateItemStatus({
          accountID,
          itemID: item.itemID,
          cartID,
          status: "fulfilled",
        });
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export { initiatePayment };

import { nanoid } from "nanoid";
import { initializePaymentSuccess, successfulVerification } from "../utils/templates/paystack.js";
import {
  createEnrollmentMySQL,
  getPaymentInfoByReferenceIDMySQL,
  saveInitializedPaymentMySQL,
  updateCartStateMySQL,
} from "../data/index.js";
import fetch from "node-fetch";
import { enrollPaidCourse } from "./courses_mgt.js";
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
          amount:Math.round( amount*100),
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
  try {
    //get paymentInfo which matches referenceID
    let paymentInfo = await getPaymentInfoByReferenceIDMySQL(referenceID);
    let { itemID: cartID, paymentID } = paymentInfo;
    //update cart state
    await updateCartStateMySQL({ cartID, state: "paid" });
    let cartInfo = await getCartInfo(cartID);
    let { accountID, cart } = cartInfo;
    console.log({ accountID, cart });
    await sortPaidItems({
      cartItems: cart.items,
      accountID,
      cartID,
      paymentID,
    });
    return { info: "Payment processed and completed. " };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let sortPaidItems = async ({
  cartItems = [],
  accountID,
  cartID,
  paymentID,
}) => {
  try {
    for (const item of cartItems) {
      console.log({ item });
      if (item.status?.name === "fulfilled") {
        return
      }
      if (item.type === "course" && item.action==="enrollment") {
        //create enrollment
        let responseOfEnrollment = await enrollPaidCourse({
          courseID: item.itemID,
          accountID,
          paymentID,
          state: "active",
          cartID,
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

let verifyPayment = async ({ referenceID }) => {
  try {
    let response = await fetch(
      `https://api.paystack.co/transaction/verify/${referenceID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        }
      }
    );
    if (!response.ok) {
      throw await response.text()
    }
    
    /**
     * @type {successfulVerification}
     */
    let data=await response.json()
   let status= data.data.status
    return status;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let getUnverifiedPayments = async () => {
  return await getUnverifiedPaymentsMySQL()
};
export { initiatePayment, updateSuccessfulPaymentInfo,verifyPayment,getUnverifiedPayments };

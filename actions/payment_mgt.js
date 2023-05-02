import { nanoid } from "nanoid";
import { initializePaymentSuccess } from "../utils/templates/paystack.js";
import { saveInitializedPaymentMySQL } from "../data/index.js";
import fetch from 'node-fetch';

let initiatePayment = async ({accountID, email, amount,itemID }) => {
  try {
    let reference = nanoid();
   let response=await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      port: 443,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },body:JSON.stringify({email,amount:amount*100,reference,callback_url:`${process.env.SERVER_URL}/api/payments/paystack/callback`})
    });
    if (!response.ok) {
      throw await response.text()
    }
    /**
     * @type {initializePaymentSuccess}
     */
    let data=await response.json()
    //save payment
    let paymentID=await saveInitializedPaymentMySQL({accountID,referenceID:reference,itemID,amount,state:"initialized"});
    return {...data,paymentID}
  } catch (error) {
    console.log(error)
    throw error
  }
};

export {initiatePayment}

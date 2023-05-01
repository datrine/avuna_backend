import { nanoid } from "nanoid";
import { initializePaymentSuccess } from "../utils/templates/paystack";
import { saveInitializedPaymentMySQL } from "../data/index.js";

let initiatePayment = async ({accountID, email, amount }) => {
  try {
    amount = amount * 100;
    let reference = nanoid();
   let response=await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      port: 443,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },body:JSON.stringify({email,amount,reference,callback_url:`${process.env.SERVER_URL}/payments/paystack/callback`})
    });
    if (!response.ok) {
      throw await response.text()
    }
    /**
     * @type {initializePaymentSuccess}
     */
    let data=await response.json()
    //save payment
    saveInitializedPaymentMySQL({accountID,referenceID})
  } catch (error) {
    console.log(error)
    throw error
  }
};

export {initiatePayment}

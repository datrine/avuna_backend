import { nanoid } from "nanoid";
import knex from "./conn.js";
/**
 * @param {object} obj
 * @param {object} obj.cart
 * @param {[{unitPrice:number,totalPrice:number,itemID:""}]} obj.cart.items
 * @param {"active"|"inactive"} obj.state
 * @param {string} obj.accountID
 *
 */
let createCart = async ({ cart, state, accountID }) => {
  try {
    let cartID = nanoid();
    state = JSON.stringify({ name: state, setOn: new Date() });
    let responseOfCreate = await knex("carts").insert({
      cart: JSON.stringify(cart),
      state,
      cartID,
      accountID,
    });
    return { info: "cart created", cartID };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let getMyActiveCarts=async(accountID)=>{
    try {
       let carts=await knex("carts").select("*").whereRaw(` JSON_EXTRACT(state, "$.name")='active' and accountID='${accountID}'`)
       carts=carts.map(cart=>({...cart.cart,cartID:cart.cartID}))
       return carts
    } catch (error) {
        
    }
}

let getCartInfo=async(cartID)=>{
  try {
     let [cart]=await knex("carts").select("*").whereRaw(`cartID='${cartID}'`)
     return cart
  } catch (error) {
      
  }
}
export { createCart as createCartMySQL, getMyActiveCarts as getMyActiveCartsMySQL,getCartInfo as getCartInfoMySQL };

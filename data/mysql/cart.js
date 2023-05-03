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

let getMyActiveCarts = async (accountID) => {
  try {
    let carts = await knex("carts")
      .select("*")
      .whereRaw(
        ` JSON_EXTRACT(state, "$.name")='active' and accountID='${accountID}'`
      );
    carts = carts.map((cart) => ({ ...cart.cart, cartID: cart.cartID }));
    return carts;
  } catch (error) {}
};

let getCartInfo = async (cartID) => {
  try {
    let [cart] = await knex("carts").select("*").whereRaw(`cartID='${cartID}'`);
    return cart;
  } catch (error) {}
};

let updateItemStatus = async ({ accountID, cartID, itemID, status }) => {
  try {
    let trx = await knex.transactionProvider()();
    let [cart] = await trx("carts")
      .select("*")
      .whereRaw(`cartID='${cartID}' and accountID='${accountID}'`);
    if (!cart) {
      throw { msg: "cartID/accountID does not match record" };
    }
    let items = cart.cart.items;
    let indexOf = items.findIndex((item) => item.itemID === itemID);
    if (!indexOf) {
      throw { msg: "itemID not found in cart" };
    }
    status = { name: status, setOn: new Date() };
    items[indexOf].status = status;
    cart.items = items;
    cart = JSON.stringify(cart);
    let { state: oldState, stateHistory = [] } = cart;
    let stateOfSome;
    for (const item of items) {
      if (item.status?.name === "fulfilled") {
        stateOfSome = "fulfilled";
      } else {
        stateOfSome = undefined;
      }
    }
    let state;
    if (stateOfSome === "fulfilled") {
      state = {};
      state.name = "fulfilled";
      state.setOn = new Date();
    } else {
      state = oldState;
    }
    if (!stateHistory[stateHistory.length - 1].name === state.name) {
      stateHistory.push(oldState);
    }
    let updates = JSON.stringify({ cart, state, stateHistory });
    let updateRes = await trx("carts")
      .update({ ...updates })
      .where({ cartID, accountID });
    await trx.commit();
    return { info: "item state updated" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export {
  createCart as createCartMySQL,
  getMyActiveCarts as getMyActiveCartsMySQL,
  getCartInfo as getCartInfoMySQL,updateItemStatus as updateItemStatusMySQL
};

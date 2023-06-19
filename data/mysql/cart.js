import { nanoid } from "nanoid";
import fn  from "./conn.js";
let knex=fn()
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
    let [cartInfo] = await trx("carts")
      .select("*")
      .whereRaw(`cartID='${cartID}' and accountID='${accountID}'`);
    if (!cartInfo) {
      throw { msg: "cartID/accountID does not match record" };
    }
    let cart = cartInfo.cart;
    let items = cart.items;
    console.log({ itemID });
    let indexOf = items.findIndex((item) => item.itemID === itemID);
    if (indexOf === -1) {
      throw { msg: "itemID not found in cart" };
    }
    status = { name: status, setOn: new Date() };
    items[indexOf].status = status;
    cart.items = items;

    let { state: oldState, stateHistory } = cartInfo;
    let stateOfSome;
    for (const item of items) {
      if (item.status?.name === "fulfilled") {
        stateOfSome = "fulfilled";
      } else {
        stateOfSome = undefined;
      }
    }
    console.log({ items });
    let state;
    if (stateOfSome === "fulfilled") {
      state = {};
      state.name = "fulfilled";
      state.setOn = new Date();
    } else {
      state = oldState;
    }
    stateHistory = stateHistory || [];
    if (!stateHistory[stateHistory.length - 1]?.name === state.name) {
      stateHistory.push(oldState);
    }
    let updates = JSON.parse(
      JSON.stringify({
        cart: JSON.stringify(cart),
        state: JSON.stringify(state),
        stateHistory: JSON.stringify(stateHistory),
      })
    );
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

let updateCartState = async ({ cartID, state }) => {
  try {
    let trx = await knex.transactionProvider()();
    let [cartInfo] = await trx("carts")
      .select("*")
      .whereRaw(`cartID='${cartID}'`);
    if (!cartInfo) {
      throw { msg: "cartID does not match record" };
    }
    state = { name: state, setOn: new Date() };
    let { state: oldState, stateHistory } = cartInfo;
    stateHistory = stateHistory || [];
    console.log({ stateHistory });
    if (!stateHistory[stateHistory.length - 1]?.name === state.name) {
      stateHistory.push(oldState);
    }
    let updates = JSON.parse(
      JSON.stringify({
        state: JSON.stringify(state),
        stateHistory: JSON.stringify(stateHistory),
      })
    );
    console.log({ updates });
    let updateRes = await trx("carts")
      .update({ ...updates })
      .where({ cartID });
    await trx.commit();
    return { info: "cart state updated" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  createCart as createCartMySQL,
  getMyActiveCarts as getMyActiveCartsMySQL,
  getCartInfo as getCartInfoMySQL,
  updateItemStatus as updateItemStatusMySQL,
  updateCartState as updateCartStateMySQL,
};

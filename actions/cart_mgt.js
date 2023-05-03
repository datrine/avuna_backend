import { createCartMySQL, getCartInfoMySQL, getMyActiveCartsMySQL, updateItemStatusMySQL } from "../data/index.js";

const createCart = async (...obj) => {
  try {
    return await createCartMySQL(...obj);
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getMyActiveCarts = async (accountID) => {
  try {
    return await getMyActiveCartsMySQL(accountID);
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateCartState = async (...obj) => {
  try {
    return await updateCartStateMySQL(...obj);
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateItemStatus = async (...obj) => {
  try {
    return await updateItemStatusMySQL(...obj);
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getCartInfo = async (cartID) => {
  try {
    return await getCartInfoMySQL(cartID);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export { createCart, getMyActiveCarts ,getCartInfo,updateItemStatus,updateCartState};

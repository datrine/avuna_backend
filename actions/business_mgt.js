import { createBusinessMySQL, editBusinessMySQL } from "../data/index.js";

const createBusiness = async (...obj) => {
  return await createBusinessMySQL(...obj);
};
const editBusiness = async (...obj) => {
  return await editBusinessMySQL(...obj);
};

export {createBusiness,
  editBusiness,
};

export default function (regObj) {
  if (!(regObj && typeof regObj === "object")) {
    return { isValid: false, msg: "No data" };
  }
  let {
     code,
    title,
     desc,
     state,
  } = regObj;
  if (!title) {
    return { isValid: false, msg: "Course t not supplied" };
  }
  return { isValid: true, regObj };
}

export default function (loginObj) {
  if (!(loginObj && typeof loginObj === "object")) {
    return { isValid: false, msg: "No data" };
  }
  let {
    email,
    password,
  } = loginObj;
  if (!email) {
    return { isValid: false, msg: "Email not supplied" };
  }
  if (!password) {
    return { isValid: false, msg: "Password not supplied" };
  }
  return { isValid: true, loginObj };
}

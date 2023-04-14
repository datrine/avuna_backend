export default function (regObj) {
  if (!(regObj && typeof regObj === "object")) {
    return { isValid: false, msg: "No data" };
  }
  let {
    email,
    password,
    f_name,
    l_name,
    age_range,
    sex,
    country,
    referral_code,
  } = regObj;
  if (!email) {
    return { isValid: false, msg: "Email not supplied" };
  }
  if (!password) {
    return { isValid: false, msg: "Password not supplied" };
  }
  if (!f_name) {
    return { isValid: false, msg: "First name not supplied" };
  }
  if (!l_name) {
    return { isValid: false, msg: "Surname not supplied" };
  }
  return { isValid: true, regObj };
}

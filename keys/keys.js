const { createECDH, getCurves } = await import("node:crypto");
let generateKeyPair = () => {
  try {
    let ecdh = createECDH("secp384r1");
    ecdh.generateKeys();
    return ecdh;
  } catch (error) {
    console.log(error);
  }
};
let ecdh=generateKeyPair()
export { ecdh };
